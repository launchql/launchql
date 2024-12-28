import { BaseModel } from '../src/base';

type UUID = string;

// Rename the interface to IUser or UserData to avoid conflicts
interface IUser {
  id: UUID;
  email: string;
}

class User extends BaseModel<IUser> {
  private _email: string;
  private _id: UUID;

  constructor(data: Partial<IUser>) {
    super(data);
    this._id = data.id;
    this._email = data.email;
  }

  public get id(): UUID {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  // Setter for email with dirty tracking
  public set email(value: string) {
    this._email = value;
    this.markDirty('email');
  }
}

it('Example Usage', async () => {
  const user = new User({ email: 'example@email.com' });

  expect(user.email).toBe('example@email.com'); 
  expect(user.getDirtyFields()).toEqual([]);

  user.email = 'Another@Example.com';
  expect(user.getDirtyFields()).toEqual(['email']);

  await user.save();
  expect(user.getDirtyFields()).toEqual([]);
});
