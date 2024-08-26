export const drlFetchRecord = async (did: string, recordId: string) => {
  const dwebUrl = `https://dweb/${did}/records/${recordId}`;
  return fetch(dwebUrl);
};

export const drlFetchRecordJson = async (did: string, recordId: string) => {
  const res = await drlFetchRecord(did, recordId);
  return handleJsonResponse(res);
};

export const drlReadProtocolUrl = (did: string, protocolIdUri: string, subpath: string) => {
  const encodedProtocolIdUri = encodeURIComponent(`${protocolIdUri}`);
  return `https://dweb/${did}/read/protocols/${encodedProtocolIdUri}/${subpath}`;
};

export const drlReadProtocol = async (
  did: string,
  protocolIdUri: string,
  subpath: string
) => {
  const dwebUrl = drlReadProtocolUrl(did, protocolIdUri, subpath);
  return fetch(dwebUrl);
};

export const drlReadProtocolJson = async (
  did: string,
  protocolIdUri: string,
  subpath: string
) => {
  const res = await drlReadProtocol(did, protocolIdUri, subpath);
  console.info("drlReadProtocolJson", {res}); // TODO: remove
  return handleJsonResponse(res);
};

const handleJsonResponse = async (res: Response) => {
  if (res.ok) {
    return res.json();
  } else {
    const errorText = await res.text().catch((err) => err);
    throw new Error(`${res.status} ${errorText}`);
  }
};
