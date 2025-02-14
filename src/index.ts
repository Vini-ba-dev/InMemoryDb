import { UserSchema } from "./Mocks";
import { users } from "./Mocks";
import { Modifier } from "./types";
import { Model } from "./Model";

const clientModel = new Model<UserSchema>();
clientModel.create(users[0]);
clientModel.update({
  where: [
    {
      field: "name",
      value: "Al",
      modifier: Modifier.start,
    },
  ],
  data: {
    age: 26,
  },
});
clientModel.update({
  where: [
    {
      field: "name",
      value: "Al",
      modifier: Modifier.start,
    },
  ],
  data: {
    age: 27,
  },
});

const all = clientModel.getAll();
console.log(all);
const versions = clientModel.getVersions();
console.log(versions);
