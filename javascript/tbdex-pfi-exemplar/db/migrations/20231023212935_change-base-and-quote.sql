-- migrate:up
ALTER TABLE offering RENAME COLUMN basecurrency TO payoutcurrency;
ALTER TABLE offering RENAME COLUMN quotecurrency TO payincurrency;

-- migrate:down
ALTER TABLE offering RENAME COLUMN payoutcurrency TO basecurrency;
ALTER TABLE offering RENAME COLUMN payincurrency TO quotecurrency;
