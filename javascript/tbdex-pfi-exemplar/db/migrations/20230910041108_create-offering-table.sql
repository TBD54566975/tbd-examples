-- migrate:up
CREATE TABLE offering (
  id SERIAL PRIMARY KEY,
  offeringid VARCHAR(255) NOT NULL,
  basecurrency VARCHAR(255) NOT NULL,
  quotecurrency VARCHAR(255) NOT NULL,
  offering JSON NOT NULL,
  CONSTRAINT offeringid_idx UNIQUE (offeringid)
);


-- migrate:down
DROP TABLE offering;
