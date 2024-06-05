-- migrate:up
CREATE TABLE offering (
  id SERIAL PRIMARY KEY,
  offeringid VARCHAR(255) NOT NULL,
  basecurrency CHAR(3) NOT NULL,
  quotecurrency CHAR(3) NOT NULL,
  offering JSON NOT NULL,
  CONSTRAINT offeringid_idx UNIQUE (offeringid)
);


-- migrate:down
DROP TABLE offering;
