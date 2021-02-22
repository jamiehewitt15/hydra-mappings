import { BaseModel, BytesField, Model, StringField } from 'warthog';

@Model({ api: {} })
export class Post extends BaseModel {
  @StringField({})
  content!: string;

  @BytesField({})
  author!: Buffer;

  constructor(init?: Partial<Post>) {
    super();
    Object.assign(this, init);
  }
}
