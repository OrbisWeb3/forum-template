import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Sidebar from '../components/Sidebar';
import PostItem from '../components/PostItem';
import Footer from '../components/Footer';
import { HeroOrbisIcon , LoadingCircle } from "../components/Icons";
import { Orbis, useOrbis } from "@orbisclub/components";

function Home({defaultPosts}) {
  const { orbis, user } = useOrbis();
  const [nav, setNav] = useState("all");
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState(defaultPosts);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  /** Load all of the categories (sub-contexts) available in this forum */
  useEffect(() => {
    loadContexts();

    /** Load all categories / contexts under the global forum context */
    async function loadContexts() {
      let { data, error } = await orbis.api.from("orbis_contexts").select().eq('context', global.orbis_context).order('created_at', { ascending: false });
      setCategories(data);
    }
  }, []);

  /** Will re-load list of posts when navigation is updated */
  useEffect(() => {
    /** Reset page */
    setPage(0);

    /** Load posts */
    if(nav == "all") {
      loadPosts(global.orbis_context, true, 0);
    } else {
      loadPosts(nav, true, 0);
    }
  }, [nav]);

  /** Will re-load the posts when page is updated */
  useEffect(() => {
    if(nav == "all") {
      loadPosts(global.orbis_context, true, page);
    } else {
      loadPosts(nav, true, page);
    }
  }, [page]);

  /** Load list of posts using the Orbis SDK */
  async function loadPosts(context, include_child_contexts, _page) {
    setLoading(true);
    let { data, error } = await orbis.getPosts({
      context: context,
      only_master: true,
      include_child_contexts: include_child_contexts,
    }, _page, 25);

    /** Save data in posts state */
    if(data) {
      setPosts(data);
    }

    /** Disable loading state */
    setLoading(false);
  }

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">Orbis Forum | Let&apos;s build web3 social together</title>
        <meta property="og:title" content="Orbis Forum | Let&apos;s build web3 social together" key="og_title" />

        {/** Description */}
        <meta name="description" content="Discuss the future of Orbis and experience the power of Open Social on our Orbis Forum." key="description"></meta>
        <meta property="og:description" content="Discuss the future of Orbis and experience the power of Open Social on our Orbis Forum." key="og_description"/>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
        <div className="antialiased">
          <div className="min-h-screen flex">

            {/*  Page content */}
            <main className="grow overflow-hidden">
              {/*  Site header */}
              <Header />

              {/*  Page sections */}
              <Hero title="Welcome to the Orbis Forum!" description="Respectful and good-faith discussion should be the cornerstone of any decision-making process. In trying to enact change, please keep this principle in mind." image={<HeroOrbisIcon />} />

              {/* Page content */}
              <section>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                  <div className="md:flex md:justify-between md:divide-x md:divide-slate-200">

                    {/* Main content */}
                    <div className="md:grow pt-3 pb-12 md:pb-20">
                      <div className="md:pr-6 lg:pr-10">
                        <CategoriesNavigation categories={categories} nav={nav} setNav={setNav} />
                        {/** Show loading state or list of posts */}
                        {loading ?
                          <div className="flex w-full justify-center p-3 text-gray-900">
                            <LoadingCircle />
                          </div>
                        :
                          <>
                            {/* Display posts if any */}
                            {(posts && posts.length > 0) ?
                              <>
                                <div className="mb-12">
                                  <div className="flex flex-col space-y-3 mb-8">
                                    {posts.map((post) => {
                                      return (
                                        <PostItem post={post} key={post.stream_id} />
                                      );
                                    })}
                                  </div>

                                  {/* Handle pagination */}
                                  {posts && posts.length >= 25 &&
                                    <div className="text-right">
                                      <button className="btn-sm py-1.5 h-8 btn-secondary btn-secondary-hover" onClick={() => setPage(page + 1)}>
                                        Next page <span className="tracking-normal ml-1">-&gt;</span>
                                      </button>
                                    </div>
                                  }

                                </div>
                              </>
                            :
                              <div className="w-full text-center bg-[#F9FAFB] rounded border border-slate-200 p-6">
                                <p className="text-sm text-secondary">There aren&apos;t any posts shared here.</p>
                              </div>
                            }
                          </>
                        }
                      </div>
                    </div>
                    <Sidebar />
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>

        {/*  Site footer */}
        <Footer />
      </div>
    </>
  );
}

const CategoriesNavigation = ({ categories, nav, setNav }) => {
  return(
    <div className="border-b border-slate-200 pb-6 mb-6">
      <div className="text-center md:text-left md:flex justify-between items-center">
        {/* Right: Button */}
        <div className="mb-4 md:mb-0 md:order-1 md:ml-6">
          <Link className="btn-sm py-1.5 btn-brand" href="/create">Create Post</Link>
        </div>

        {/* Left: Links */}
        <ul className="grow inline-flex flex-wrap text-sm font-medium -mx-3 -my-1">
          <NavItem selected={nav} category={{stream_id: "all", content: {displayName: "All"}}} onClick={setNav} />
          {categories.map((category, key) => {
            return (
              <NavItem key={key} selected={nav} category={category} onClick={setNav} />
            );
          })}
        </ul>
      </div>
    </div>
  )
}

const NavItem = ({selected, category, onClick}) => {
  return(
    <li className="px-3 py-1">
      <span className={`relative transition duration-150 ease-in-out ${selected == category.stream_id ? "text-brand underline underline-offset-4" : "cursor-pointer text-secondary hover:text-[#333]"}`} onClick={() => onClick(category.stream_id)}>{category.content.displayName}</span>
    </li>
  )
}

/** Load blog articles */
Home.getInitialProps = async (context) => {
  let orbis_server = new Orbis({
    useLit: false
  });
  let { data, error } = await orbis_server.getPosts({
    context: global.orbis_context,
    only_master: true,
    include_child_contexts: true
  });

  /** Return results */
  return {
    defaultPosts: data
  };
}

export default Home;
