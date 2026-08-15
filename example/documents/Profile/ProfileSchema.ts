import { Schema, type Infer } from '@kravc/schema';

const ProfileSchema = new Schema({
  name: {
    example: 'John Doe',
    required: true,
    minLength: 1,
    maxLength: 256,
    description: 'Profile name',
  },
}, 'Profile');

export type ProfileBodyAttributes = Infer<typeof ProfileSchema>;

export default ProfileSchema;
