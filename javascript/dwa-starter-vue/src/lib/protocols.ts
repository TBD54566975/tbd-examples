import { DwnApi } from "@web5/api";


const tasksProtocolSchema = "https://schema.org/TaskSample";
const tasksProtocolTypeTaskSchema = "https://schema.org/TaskSample/schemas/name";


export const tasksProtocolDefinition = {
  published: true,
  protocol: tasksProtocolSchema,
  types: {
    task: {
      dataFormats: ["application/json"],
      schema: tasksProtocolTypeTaskSchema,
    }
  },
  structure: {
    task: {
      $tags: {
        $requiredTags: ["completed"],
        completed: {
          type: "boolean"
        }
      }
    }
  }
}

export const task = {
  definition: tasksProtocolDefinition,
  uri: tasksProtocolSchema,
  schemas: {
    task: tasksProtocolTypeTaskSchema,
  }
}


const protocolSchema = "https://schema.org/ProfileSample";
const protocolTypeNameSchema = "https://schema.org/ProfileSample/schemas/name";

export const profileDefinition = {
  published: true,
  protocol: protocolSchema,
  types: {
    name: {
      dataFormats: ["application/json"],
      schema: protocolTypeNameSchema,
    },
    avatar: { dataFormats: ["image/gif", "image/png", "image/jpeg"] },
  },
  structure: { name: {}, avatar: {} },
};

export const profile = {
  definition: profileDefinition,
  uri: protocolSchema,
  schemas: {
    name: protocolTypeNameSchema,
  },
};

export const byUri = {
  [profileDefinition.protocol]: profile,
  [tasksProtocolDefinition.protocol]: task,
};

export const installProtocols = async (dwn: DwnApi, did: string) => {
  const installed = await dwn.protocols.query({ message: {} });
  const configurationPromises = [];
  console.info(JSON.stringify(profileDefinition), { profile });
  try {
    for (const protocolUri in byUri) {
      const record = installed.protocols.find(
        (record) => protocolUri === record.definition.protocol
      );
      if (!record) {
        console.info("installing protocol: " + protocolUri);
        const definition = byUri[protocolUri].definition;
        configurationPromises.push(
          dwn.protocols.configure({
            message: { definition },
          })
        );
      } else {
        console.info("protocol already installed: " + protocolUri);
      }
    }

    const configurationResponses = await Promise.all(configurationPromises);
    try {
      await Promise.all(
        configurationResponses.map(({ protocol }) => protocol?.send(did))
      );
    } catch (e) {
      console.log("remote push of configuration failed", e);
      return true;
    }
  } catch (e) {
    console.log("local install of configuration failed", e);
    return false;
  }
  return true;
};
