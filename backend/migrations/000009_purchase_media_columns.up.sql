ALTER TABLE purchases
  ADD COLUMN photo_id INTEGER REFERENCES media(id),
  ADD COLUMN video_id UUID REFERENCES videos(id); 