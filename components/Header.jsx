import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Logo, CommunityIcon, PanelRight, SearchIcon, MenuVerticalIcon, LoadingCircle } from "./Icons";
import useOutsideClick from "../hooks/useOutsideClick";
import { useOrbis, User, UserPopup, Chat } from "@orbisclub/components";

function Header() {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [showCommunityChat, setShowCommunityChat] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="w-full z-30 bg-gradient-to-b from-[#EBF3FE] to-[#FFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Site branding */}
            <div className="shrink-0 mr-4">
              {/* Logo container */}
              <Link href="/" className="text-primary">
                <Logo />
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="flex grow text-primary">
              {/* Desktop sign in links */}
              <ul className="flex grow justify-end flex-wrap items-center">
                <li className="hidden md:flex">
                  <SearchBar />
                </li>
                <li>
                  <Link className="text-sm font-medium hover:underline px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out"
                    href="/post/kjzl6cwe1jw14b9pin02aak0ot08wvnrhzf8buujkop28swyxnvtsjdye742jo6">
                    Learn more
                  </Link>
                </li>
                {/** Show connect button or user connected */}
                {user ?
                  <li className="relative ml-3 mr-3">
                    <div className="text-sm font-medium flex flex-row items-center space-x-4 rounded hover:bg-slate-300/[.2] px-3 py-2 cursor-pointer" onClick={() => setShowUserMenu(true)}>
                      <User details={user} height={30} />
                      <MenuVerticalIcon />
                    </div>

                    {/** Showing user menu */}
                    {showUserMenu &&
                      <UserMenuVertical hide={() => setShowUserMenu(false)} />
                    }
                  </li>
                :
                  <li className="ml-3">
                    <div className="btn-sm btn-main w-full" onClick={() => setConnectModalVis(true)}>Connect</div>
                  </li>
                }
                {/** Will open the discussion feed on the right */}
                <li className="ml-3">
                  <div className="btn-sm btn-secondary w-full" onClick={() => setShowCommunityChat(true)}>
                    Community Chat <PanelRight style={{marginLeft: 5}} />
                  </div>
                </li>

              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/** Show community chat if enabled */}
      {showCommunityChat &&
        <ChatPanel hide={() => setShowCommunityChat(false)} />
      }
    </>
  );
}

/** User menu with update profile and logout buttons */
const UserMenuVertical = ({hide}) => {
  const { orbis, user, setUser, setConnectModalVis } = useOrbis();
  const [showUserPopup, setShowUserPopup] = useState(false);
  const wrapperRef = useRef(null);

  /** Is triggered when clicked outside the component */
  useOutsideClick(wrapperRef, () => hide());

  async function logout() {
    let res = await orbis.logout();
    setUser(null);
    hide();
  }

  return(
    <>
      <div className="absolute top-[0px] right-[0px] py-10 z-50 w-[165px]">
        <div className="text-sm shadow-md bg-white border border-gray-200 p-3 rounded-md flex flex-col w-full space-y-1" ref={wrapperRef}>
          <div className="text-primary font-medium hover:bg-gray-50 cursor-pointer rounded py-1.5 px-2" onClick={() => setShowUserPopup(true)}>Update profile</div>
          <div className="text-primary font-medium hover:bg-gray-50 cursor-pointer rounded py-1.5 px-2" onClick={() => logout()}>Logout</div>

          {showUserPopup &&
            <BackgroundWrapper hide={() => setShowUserPopup(false)}>
              <div className="flex pointer-events-auto w-screen justify-center">
                <UserPopup details={user} position="relative" />
              </div>
            </BackgroundWrapper>
          }
        </div>
      </div>
    </>
  )
}

/** Search form */
const SearchBar = () => {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if(search && search.length > 2) {
      loadPosts();
    } else {
      setPosts([]);
    }

    async function loadPosts() {
      setLoading(true);
      let { data, error } = await orbis.getPosts({
        context: global.orbis_context,
        include_child_contexts: true,
        term: search
      });
      if(error) {
        console.log("error:", error);
      }
      console.log("data:", data);
      setPosts(data);
      setLoading(false);
    }
  }, [search]);

  return(
    <form>
      <div className="flex flex-wrap">
        <div className="relative flex w-full flex-col flex-start">
          <div className="relative flex items-center">
            <input id="search" type="search" className="bg-white placeholder:text-slate-500 text-slate-900 border border-slate-200 py-1 w-full pl-10 rounded-full text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="absolute inset-0 right-auto flex items-center justify-center">
              <SearchIcon />
            </div>
          </div>
          {/** Show search results */}
          {(search && search.length > 2) &&
            <div className="absolute top-[32px] right-[0px] z-50 w-[300px] ">
              <div className="text-sm shadow-md bg-white border border-gray-200 p-2 rounded-md flex flex-col w-full space-y-1">
                {loading ?
                  <div className="flex p-3 justify-center text-primary">
                    <LoadingCircle />
                  </div>
                :
                  <>
                    {(posts && posts.length > 0) ?
                      <>
                        {posts.map((post, key) => {
                          if(post.content.master) {
                            return (
                              <Link key={post.stream_id} className="text-secondary font-medium hover:bg-gray-50 cursor-pointer rounded py-1.5 px-2" href={"/post/" + post.content.master}>· {post.content.title ? post.content.title : <>{post.content.body.substring(0,25)}...</>}</Link>
                            );
                          } else {
                            return (
                              <Link key={post.stream_id} className="text-primary font-medium hover:bg-gray-50 cursor-pointer rounded py-1.5 px-2" href={"/post/" + post.stream_id}>{post.content.title ? post.content.title : <>{post.content.body.substring(0,25)}...</>}</Link>
                            );
                          }

                        })}
                      </>
                    :
                      <div className="w-full text-tertiary text-sm text-center p-3">There isn&apos;t any result for this query.</div>
                    }
                  </>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </form>
  )
}

const ChatPanel = ({hide}) => {
  const wrapperRef = useRef(null);

  /** Is triggered when clicked outside the component */
  useOutsideClick(wrapperRef, () => hide());

  return(
    <div className="relative z-100" role="dialog" aria-modal="true" style={{zIndex: 100}}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity blur cursor-pointer"></div>
        <div className="absolute inset-0 overflow-hidden cursor-pointer">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 cursor-default" ref={wrapperRef}>
            <div className="pointer-events-auto w-screen" style={{width: 900}}>
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="bg-main py-6 px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white" id="slide-over-title">Discussion Feed Demo</h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button type="button" className="rounded-md bg-transparent text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white" onClick={() => hide()}>
                        <span className="sr-only">Close panel</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-[#F2F2F2]">This is a live demo of our discussion feed module. This example is gated to users active on Mainnet, Polygon, Optimism or Arbitrum. <Link href="/modules/discussion-feed" className="font-medium text-white hover:underline">Learn more</Link></p>
                  </div>
                </div>
                <div className="relative flex-1 overflow-scoll">
                  <div className="absolute inset-0">
                    <div className="h-full" aria-hidden="true">
                      {/** Chat feed */}
                      <Chat context="kjzl6cwe1jw147040w6bj3nkvny3ax30q76ib5ytxo6298psrx1oawa3wmme2jx" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Background wrapper used to surround modals or side panels */
const BackgroundWrapper = ({hide, children}) => {
  const wrapperRef = useRef(null);

  /** Is triggered when clicked outside the component */
  useOutsideClick(wrapperRef, () => hide());
  return(
    <div className="relative z-100" aria-labelledby="slide-over-title" role="dialog" aria-modal="true" style={{zIndex: 100}}>
      <div className="fixed inset-0 overflow-hidden">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity bg-blur cursor-pointer" onClick={() => hide()}></div>
        {children}
      </div>
    </div>
  )
}

export default Header;
