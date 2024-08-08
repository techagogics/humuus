function rpcStorageAPI(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {
  // Return if no match type in payload
  if (payload.length === 0) {
    return JSON.stringify({ success: false });
  }

  enum API {
    WRITE = 0,
    DELETE = 1,
    GET = 2,
  }

  enum ReadPermissions {
    NO_READ = 0,
    OWNER_READ = 1,
    PUBLIC_READ = 2,
  }

  enum WritePermissions {
    NO_WRITE = 0,
    OWNER_WRITE = 1,
  }

  let operation = JSON.parse(payload).operation;

  let key = JSON.parse(payload).key;

  let collection = JSON.parse(payload).collection;

  let data = JSON.parse(payload).data;

  switch (operation) {
    case API.WRITE:
      try {
        nk.storageWrite([
          {
            key: key,
            collection: collection,
            value: { data },
            userId: '00000000-0000-0000-0000-000000000000',
            permissionRead: ReadPermissions.PUBLIC_READ,
            permissionWrite: WritePermissions.OWNER_WRITE,
          },
        ]);
      } catch (err) {
        return JSON.stringify({ success: false, error: err });
      }

      return JSON.stringify({ success: true });

    case API.DELETE:
      try {
        nk.storageDelete([
          {
            collection: collection,
            key: key,
            userId: '00000000-0000-0000-0000-000000000000',
          },
        ]);
      } catch (err) {
        return JSON.stringify({ success: false, error: err });
      }

      return JSON.stringify({ success: true });

    case API.GET:
      let objects: nkruntime.StorageObject[] = [];

      try {
        objects = nk.storageRead([
          {
            collection: collection,
            key: key,
            userId: '00000000-0000-0000-0000-000000000000',
          },
        ]);
      } catch (err) {
        return JSON.stringify({ success: false, error: err });
      }

      let result = objects[0].value.data;

      return JSON.stringify({ success: true, result });
  }

  return JSON.stringify({ success: false });
}
