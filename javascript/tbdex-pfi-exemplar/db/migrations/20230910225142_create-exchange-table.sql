-- migrate:up
CREATE TABLE exchange (
  id SERIAL PRIMARY KEY,
  exchangeid VARCHAR(255) NOT NULL,
  messageid VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  messagekind TEXT CHECK (messageKind IN ('rfq', 'quote', 'order', 'close', 'orderstatus')) NOT NULL,
  message JSON NOT NULL
);

CREATE INDEX exchangeid_idx ON exchange(exchangeid);
CREATE INDEX subject_idx ON exchange(subject);
CREATE INDEX messagekind_idx ON exchange(messagekind);
-- migrate:down
DROP TABLE exchange;
