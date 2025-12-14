-- Create shared_files table for coach-customer file sharing
CREATE TABLE IF NOT EXISTS shared_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_files_coach_id ON shared_files(coach_id);
CREATE INDEX IF NOT EXISTS idx_shared_files_customer_id ON shared_files(customer_id);
CREATE INDEX IF NOT EXISTS idx_shared_files_created_at ON shared_files(created_at);

-- Enable RLS
ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Coaches can view files they shared" ON shared_files
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Customers can view files shared with them" ON shared_files
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Coaches can insert files for their customers" ON shared_files
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update files they shared" ON shared_files
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete files they shared" ON shared_files
    FOR DELETE USING (auth.uid() = coach_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_shared_files_updated_at
    BEFORE UPDATE ON shared_files
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_files_updated_at();
