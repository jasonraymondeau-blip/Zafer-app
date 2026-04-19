-- =============================================
-- ZAFER — Script de création des tables Supabase
-- À coller dans : Dashboard Supabase → SQL Editor → New query
-- =============================================


-- =============================================
-- TABLE : profiles
-- Créée automatiquement à l'inscription via trigger
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  prenom text,
  nom text,
  telephone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Trigger : crée un profil automatiquement à chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================
-- TABLE : listings
-- =============================================
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  titre text NOT NULL,
  description text,
  prix numeric NOT NULL,
  categorie text NOT NULL CHECK (categorie IN ('vehicule', 'immobilier', 'maison')),
  sous_categorie text NOT NULL,
  ville text,
  localisation_lat numeric,
  localisation_lng numeric,
  photos text[] DEFAULT '{}',
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),

  -- Champs spécifiques véhicule
  boite_vitesse text CHECK (boite_vitesse IN ('automatique', 'manuelle', NULL)),
  kilometrage integer,

  -- Champs spécifiques immobilier
  type_bien text CHECK (type_bien IN ('maison', 'appartement', 'commerce', NULL)),
  surface integer,

  -- Champs spécifiques maison/équipement
  etat text CHECK (etat IN ('neuf', 'bon état', 'à réparer', NULL))
);

-- Index pour accélérer les recherches fréquentes
CREATE INDEX IF NOT EXISTS listings_categorie_idx ON listings(categorie);
CREATE INDEX IF NOT EXISTS listings_actif_idx ON listings(actif);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);


-- =============================================
-- TABLE : favoris
-- =============================================
CREATE TABLE IF NOT EXISTS favoris (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),

  -- Un utilisateur ne peut pas mettre deux fois la même annonce en favori
  UNIQUE(user_id, listing_id)
);


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;


-- Policies : profiles
CREATE POLICY "Profil visible par tous" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Utilisateur modifie son propre profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);


-- Policies : listings
CREATE POLICY "Annonces actives visibles par tous" ON listings
  FOR SELECT USING (actif = true);

CREATE POLICY "Utilisateur voit ses propres annonces (même inactives)" ON listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur crée ses annonces" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur modifie ses annonces" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur supprime ses annonces" ON listings
  FOR DELETE USING (auth.uid() = user_id);


-- Policies : favoris
CREATE POLICY "Utilisateur voit ses favoris" ON favoris
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur ajoute un favori" ON favoris
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur supprime un favori" ON favoris
  FOR DELETE USING (auth.uid() = user_id);


-- =============================================
-- STORAGE : bucket pour les photos d'annonces
-- =============================================

-- Créer le bucket "listings-photos"
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings-photos', 'listings-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy : tout le monde peut voir les photos
CREATE POLICY "Photos visibles publiquement" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings-photos');

-- Policy : utilisateur connecté peut uploader
CREATE POLICY "Utilisateur uploade ses photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings-photos'
    AND auth.uid() IS NOT NULL
  );

-- Policy : utilisateur supprime ses propres photos
CREATE POLICY "Utilisateur supprime ses photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
