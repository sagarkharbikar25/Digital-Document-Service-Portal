<?php
require_once __DIR__ . '/../../app/core/Config.php';
Config::load(__DIR__ . '/../../.env');
require_once __DIR__ . '/../../app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // 1. Add metadata JSONB column to applications
    $db->exec("ALTER TABLE applications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'");
    echo "✓ Added metadata JSONB column to applications table\n";

    // 2. Ensure fee_type, transaction_id, amount columns exist
    $db->exec("ALTER TABLE applications ADD COLUMN IF NOT EXISTS fee_type VARCHAR(100)");
    $db->exec("ALTER TABLE applications ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100)");
    $db->exec("ALTER TABLE applications ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2)");
    echo "✓ Checked fee_type, transaction_id, and amount columns\n";

    // 3. Ensure index on metadata for fast JSON queries
    $db->exec("CREATE INDEX IF NOT EXISTS idx_applications_metadata ON applications USING gin (metadata)");
    echo "✓ Created GIN index on applications.metadata\n";

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

