import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrbis, User } from "@orbisclub/components";
import { LoadingCircle } from "./Icons";
import ReactTimeAgo from 'react-time-ago'

function Sidebar() {
  return (
    <aside className="md:w-64 lg:w-80 md:shrink-0 pt-6 pb-12 md:pb-20">
      <div className="md:pl-6 lg:pl-10">
        {/* Sidebar content */}
        <div className="space-y-6">
          {/* Newsletter: Coming soon
          <NewsletterBlock />
           */}

          {/* New Discussions */}
          <RecentDiscussions />

          {/* Active topics: Coming soon
            <Categories />
          */}
        </div>
      </div>
    </aside>
  );
}

/** Show recent discussions */
const RecentDiscussions = () => {
  const { orbis, user } = useOrbis();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  /** Load all of the categories (sub-contexts) available in this forum */
  useEffect(() => {
    loadPosts(global.orbis_context, true);
    async function loadPosts(context, include_child_contexts) {
      setLoading(true);
      let { data, error } = await orbis.getPosts({
        context: context,
        only_master: true,
        include_child_contexts: include_child_contexts,
        order_by: 'last_reply_timestamp'
      }, 0, 5);
      setLoading(false);


      if(error) {
        console.log("error:", error);
      }
      if(data) {
        setPosts(data);
      }
    }
  }, [])

  return(
    <div>
      <div className="text-xs uppercase text-slate-600 font-semibold mb-4">Active Discussions</div>
      <ul className="space-y-6">
        {(posts && posts.length > 0) ?
          <>
            {posts.map((post, key) => {
              return(
                <li key={key}>
                  <h3 className="text-sm mb-1">
                    <Link className="text-primary font-semibold hover:underline" href={"/post/" + post.stream_id}>{post.content.title}</Link>
                  </h3>
                  <div className="text-xs text-secondary flex flex-row items-center space-x-1">
                    <span className="text-tertiary">Last activity</span> <span><ReactTimeAgo date={post.last_reply_timestamp ? post.last_reply_timestamp * 1000 : post.timestamp * 1000} locale="en-US"/></span>
                  </div>
                </li>
              );
            })}
          </>
        :
          <div className="w-full text-center bg-[#F9FAFB] rounded border border-slate-200 p-6">
            <p className="text-sm text-secondary">There isn&apos;t any posts here yet.</p>
          </div>
        }
      </ul>
    </div>
  )
}

/** Will loop through all categories and display them */
const Categories = () => {
  const { orbis, user } = useOrbis();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  /** Load all of the categories (sub-contexts) available in this forum */
  useEffect(() => {
    loadContexts();
    async function loadContexts() {
      setLoading(true);
      let { data, error } = await orbis.api.from("orbis_contexts").select().eq('context', global.orbis_context).order('created_at', { ascending: false });
      setCategories(data);
      setLoading(false);
    }
  }, []);

return(
  <div>
    <div className="text-xs uppercase text-slate-600 font-semibold mb-4 mt-3">Active Categories</div>
    {loading ?
      <div className="flex w-full justify-center p-3 text-gray-900">
        <LoadingCircle />
      </div>
    :
      <ul className="space-y-3">
        {(categories && categories.length > 0) ?
          <>
            {categories.map((category, key) => {
              return (
                <li className="flex flex-row" key={key}>
                  <div style={{background: "#E9993E", width: 4, marginRight: 10}}></div>
                  <div className="flex flex-1 flex-wrap items-center justify-between w-full">
                    <div className="flex items-center mr-2">
                      <Link className="truncate text-sm text-primary font-semibold hover:underline" href="#0">{category.content.displayName}</Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </>
        :
          <div className="w-full text-center bg-[#F9FAFB] rounded border border-slate-200 p-6">
            <p className="text-sm text-secondary">There isn&apos;t any category in this forum.</p>
          </div>
        }

      </ul>
    }

  </div>
);
}

const NewsletterBlock = () => {
  return(
    <div>
      <div className="relative p-5 bg-white border border-brand">
        <div className="absolute inset-0 -m-px pointer-events-none -z-10 before:absolute before:inset-0 before:bg-gradient-to-t before:from-slate-700 before:to-slate-800 after:absolute after:inset-0 after:bg-slate-900 after:m-px"
          aria-hidden="true"/>
        <div className="font-semibold text-center text-brand mb-3">
          Receive our forum updates by email:
        </div>
        {/* Form */}
        <div className="w-full">
          <label className="block text-sm sr-only" htmlFor="newsletter">
            Email
          </label>
          <form className="relative flex items-center max-w-xs mx-auto">
            <input id="newsletter" type="email" className="bg-white placeholder:text-slate-500 text-slate-900 border border-slate-200 py-1 px-4 w-full rounded-full text-sm" placeholder="Your email" />
            <button type="submit" className="absolute inset-0 left-auto" aria-label="Subscribe">
              <svg className="w-3 h-3 fill-current text-brand mx-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z" fillRule="nonzero" />
              </svg>
            </button>
          </form>
          <p className="text-xs text-secondary mt-1 w-full text-center">Your email will be encrypted.</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;
