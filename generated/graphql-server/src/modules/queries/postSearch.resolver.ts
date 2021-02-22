import { ObjectType, Field, Float, Int, Arg, Query, Resolver, createUnionType } from 'type-graphql';
import { Inject } from 'typedi';
import { Post } from '../post/post.model';
import { PostSearchFTSService } from './postSearch.service';

@ObjectType()
export class PostSearchFTSOutput {
    @Field(type => PostSearchSearchItem)
    item!: typeof PostSearchSearchItem

    @Field(type => Float)
    rank!: number

    @Field(type => String)
    isTypeOf!: string

    @Field(type => String)
    highlight!: string
}

export const PostSearchSearchItem = createUnionType({
    name: "PostSearchSearchResult",
    types: () => [
        Post,
    ],
});


@Resolver()
export default class PostSearchFTSResolver {

    constructor(@Inject('PostSearchFTSService') readonly service: PostSearchFTSService) {}

    @Query(() => [PostSearchFTSOutput])
    async postSearch(
        @Arg('text') query: string, 
        @Arg('limit', () => Int, { defaultValue: 5 }) limit: number):Promise<Array<PostSearchFTSOutput>>{
        
        return this.service.search(query, limit);
    }

}