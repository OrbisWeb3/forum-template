import React from 'react';
import Link from 'next/link';
import Badge from "./Badge";
import { User, UserBadge, useOrbis } from "@orbisclub/components";
import { shortAddress } from "../utils";
import { ExternalLinkIcon, CommentsIcon } from "./Icons";

export default function PostItem({post}) {
  return (
    <div className="[&:nth-child(-n+4)]:-order-1 bg-[#F9FAFB] rounded border border-slate-200">
      <div className="relative p-5">
        <div className="sm:flex items-center space-y-3 sm:space-y-0 sm:space-x-5">
          <div className="grow lg:flex items-center justify-between space-y-5 lg:space-x-6 lg:space-y-0">
            <div>
              <div className="mb-2">
                <h2 className="mb-1">
                  <Link className="text-primary font-semibold hover:underline transition duration-150 ease-in-out" href={"/post/" + post.stream_id}>
                    {post.content.title}
                  </Link>
                </h2>
                <p className="text-sm text-secondary">{post.content.body.substring(0,180)}..</p>
              </div>
              <div className="flex items-center text-sm text-primary flex flex-row space-x-1.5">
                <User details={post.creator_details} height={35} />
                <UserBadge details={post.creator_details}  />
                <span className="text-secondary">in</span>
                {post.context_details?.context_details &&
                  <Badge title={post.context_details.context_details.displayName ? post.context_details.context_details.displayName : post.context_details.context_details.name} color="#FF9944" />
                }

                <span className="hidden md:flex text-secondary mr-2 ml-2">·</span>

                {/** Show count replies if any */}
                {(post.count_replies && post.count_replies > 0) ?
                  <>
                    <Link href={"/post/" + post.stream_id} className="hidden md:flex text-primary px-2 py-1 font-medium text-xs items-center space-y-2 rounded-md border border-transparent hover:bg-white hover:border-gray-200">{post.count_replies} <CommentsIcon style={{marginLeft: 3}} /></Link>
                    <span className="hidden md:flex text-secondary mr-2 ml-2">·</span>
                  </>
                :
                  <></>
                }

                {/** Proof link to Cerscan */}
                {post.stream_id &&
                  <Link href={"https://cerscan.com/mainnet/stream/" + post.stream_id} target="_blank" className="hidden md:flex text-primary text-xs bg-white border border-gray-200 rounded-md py-1 px-2 font-medium flex flex-row items-center hover:underline"><ExternalLinkIcon style={{marginRight: 4}} />{shortAddress(post.stream_id, 12)}</Link>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
