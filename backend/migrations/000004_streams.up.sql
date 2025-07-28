CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    bunny_stream_id VARCHAR(255) NOT NULL,
    rtmp_url TEXT NOT NULL,
    stream_key VARCHAR(255) NOT NULL,
    playback_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 