import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Logo, PanelRight, SearchIcon, MenuVerticalIcon, LoadingCircle } from "./Icons";
import useOutsideClick from "../hooks/useOutsideClick";
import { useOrbis, User, UserPopup, Chat, Post } from "@orbisclub/components";
import { getTimestamp } from "../utils";

function Header() {
  const { orbis, user, connecting, setConnectModalVis } = useOrbis();
  const [showCommunityChat, setShowCommunityChat] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    getLastTimeRead();

    async function getLastTimeRead() {
      /** Retrieve last post timestamp for this context */
      let { data, error } = await orbis.getContext(global.orbis_chat_context);

      /** Retrieve last read time for user */
      let last_read = localStorage.getItem(global.orbis_chat_context + "-last-read");
      if(last_read) {
        last_read = parseInt(last_read);
      } else {
        last_read = 0;
      }

      /** Show unread messages indicator if applicable */
      if(data && data.last_post_timestamp && (data.last_post_timestamp > last_read)) {
        setHasUnreadMessages(true);
      }
    }
  }, []);

  /** Open community chat and reset new message indicator */
  function openCommunityChat() {
    setShowCommunityChat(true);
    setHasUnreadMessages(false);
  }

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
                  <li className="flex items-center relative ml-1 mr-1">

                    {/** User CTA */}
                    <div className="text-sm font-medium flex flex-row items-center space-x-4 rounded hover:bg-slate-300/[.2] px-3 py-2 cursor-pointer" onClick={() => setShowUserMenu(true)}>
                      <User details={user} height={30} />
                      <MenuVerticalIcon />
                    </div>

                    {/** Notifications icon */}
                    <BadgeNotifications />

                    {/** Showing user menu */}
                    {showUserMenu &&
                      <UserMenuVertical hide={() => setShowUserMenu(false)} />
                    }
                  </li>
                :
                  <li className="ml-3">
                    {connecting ?
                      <div className="btn-sm btn-main w-full" onClick={() => setConnectModalVis(true)}><LoadingCircle style={{marginRight: 3}} /> Connecting</div>
                    :
                      <div className="btn-sm btn-main w-full" onClick={() => setConnectModalVis(true)}>Connect</div>
                    }

                  </li>
                }
                {/** Will open the discussion feed on the right */}
                <li className="ml-3">
                  <div className="relative btn-sm btn-secondary w-full" onClick={() => openCommunityChat()}>
                    Community Chat <PanelRight style={{marginLeft: 5}} />

                    {/** Show unread indicator if any */}
                    {hasUnreadMessages &&
                      <div className="bg-red-500 h-2.5 w-2.5 rounded-full" style={{marginLeft: 6}}></div>
                    }
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

/** Badhe showing the new notifications count if any */
const BadgeNotifications = () => {
  const { orbis } = useOrbis();
  const [countNewNotifs, setCountNewNotifs] = useState();
  const [showNotifPane, setShowNotifPane] = useState(false);

  /** Will check if user has new notifications for this context */
  useEffect(() => {
    const interval = setInterval(loadNotifications, 5000); // run loadNotifications every 5 seconds
    return () => clearInterval(interval); // cleanup function to stop the interval when the component unmounts
  }, []);
  
  async function loadNotifications() {
    try {
      const { data } = await orbis.getNotificationsCount({
        type: "social",
        context: global.orbis_context,
        include_child_contexts: true
      });
      setCountNewNotifs(data.count_new_notifications);
    } catch (error) {
      console.log("Error loading notifications:", error);
    }
  }

  return(
    <div className="flex flex-row ml-1" onClick={() => setShowNotifPane(true)}>
      <div className="flex flex-row text-gray-900 text-brand-hover  rounded hover:bg-slate-300/[.2] px-3 py-2 cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.8569 15.0817C14.7514 14.857 16.5783 14.4116 18.3111 13.7719C16.8743 12.177 15.9998 10.0656 15.9998 7.75V7.04919C15.9999 7.03281 16 7.01641 16 7C16 3.68629 13.3137 1 10 1C6.68629 1 4 3.68629 4 7L3.9998 7.75C3.9998 10.0656 3.12527 12.177 1.68848 13.7719C3.4214 14.4116 5.24843 14.857 7.14314 15.0818M12.8569 15.0817C11.92 15.1928 10.9666 15.25 9.9998 15.25C9.03317 15.25 8.07988 15.1929 7.14314 15.0818M12.8569 15.0817C12.9498 15.3711 13 15.6797 13 16C13 17.6569 11.6569 19 10 19C8.34315 19 7 17.6569 7 16C7 15.6797 7.05019 15.3712 7.14314 15.0818" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {(countNewNotifs > 0) &&
          <div className="bg-red-500 rounded-full text-white font-bold py-0.5 px-1.5 text-xs" style={{marginLeft: 6}}>{countNewNotifs}</div>
        }
      </div>

      {/** Show notifications pane */}
      {showNotifPane &&
        <NotificationsPane setCountNewNotifs={setCountNewNotifs} hide={() => setShowNotifPane(false)} />
      }
    </div>
  );
}

/** Pane with the user's notifications for this context */
const NotificationsPane = ({setCountNewNotifs, hide}) => {
  const { orbis } = useOrbis();
  const wrapperRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    loadNotifications()
    async function loadNotifications() {
      setNotificationsLoading(true);
      let { data, error } = await orbis.getNotifications({
        type: "social",
        context: global.orbis_context,
        include_child_contexts: true
      });

      if(error) {
        console.log("error getNotifications:", error);
      }

      if(data) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }

      setNotificationsLoading(false);
      setCountNewNotifs(0);

      /** Save new notification's last read timestamp */
      let _content = {
        type: "social",
        context: global.orbis_context,
        timestamp: parseInt(getTimestamp())
      };
      let res = await orbis.setNotificationsReadTime(_content);
      console.log("res:", res)
    }
  }, [])

  /** Is triggered when clicked outside the component */
  useOutsideClick(wrapperRef, () => hide());
  return(
    <div className="absolute top-[0px] right-[0px] py-10 z-50 w-[355px]">
      <div className="text-sm shadow-md bg-white border border-gray-200 rounded-md flex flex-col w-full divide-y max-h-[600px] overflow-y-scroll" ref={wrapperRef}>
        {notificationsLoading ?
          <div className="w-full px-4 py-5 flex justify-center">
            <LoadingCircle />
          </div>
        :
          <>
            {notifications.length > 0 ?
              <>
                {notifications.map((notification, key) => {
                  return (
                    <NotificationItem notification={notification} key={key} />
                  );
                })}
              </>
            :
              <p className=" p-4 text-gray-600 text-sm">You don&apos;t have any notifications here.</p>
            }
          </>
        }
      </div>
    </div>
  )
}

/** Component for the notification item */
const NotificationItem = ({notification}) => {

  /** Returns a clean name for the notification type */
  const NotificationFamily = () => {
    switch (notification.family) {
      case "reply_to":
        return <>replied:</>;
      case "follow":
        return <>is following you.</>;
      case "reaction":
        return <><Reaction />:</>;
      default:
        return notification.family;
    }
  }

  const Reaction = () => {
    switch (notification.content?.type) {
      case "like":
        return(
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand">
            <path d="M13.875 4.84375C13.875 3.08334 12.3884 1.65625 10.5547 1.65625C9.18362 1.65625 8.00666 2.45403 7.5 3.59242C6.99334 2.45403 5.81638 1.65625 4.44531 1.65625C2.61155 1.65625 1.125 3.08334 1.125 4.84375C1.125 9.95831 7.5 13.3438 7.5 13.3438C7.5 13.3438 13.875 9.95831 13.875 4.84375Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        )
      case "haha":
        return <span>HAHA!</span>
      default:

    }
  }

  return(
    <div className={`w-full flex flex-col p-3 ${notification.status == "new" ? "bg-slate-100" : "bg-white" }`}>
      <div className="flex flex-row items-center space-x-2 flex-wrap">
        <User height={35} details={notification.user_notifiying_details} />
        <span className="flex text-sm items-center"><NotificationFamily /></span>
      </div>
      {(notification.family == "reply_to" || notification.family == "reaction") &&
        <div className={`border border-slate-200 p-2 rounded-md shadow-md mt-1.5 ${notification.status == "new" ? "bg-white" : "bg-gray-50" }`}>
          {(notification.post_details && notification.post_details.content && notification.post_details.content.body) ?
            <Post post={notification.post_details} showPfp={false} showCta={false} />
          :
            <div><p className="text-italic">Post deleted...</p></div>
          }
        </div>
      }

    </div>
  )
}

/** User menu with update profile and logout buttons */
const UserMenuVertical = ({hide}) => {
  const { orbis, user, setUser } = useOrbis();
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
  const { orbis } = useOrbis();
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

/** Container for the community chat panel */
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
                    <h2 className="text-lg font-medium text-white" id="slide-over-title">Community Chat</h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button type="button" className="rounded-md bg-transparent text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white" onClick={() => hide()}>
                        <span className="sr-only">Close panel</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-[#F2F2F2]">Participate in dynamic conversations with other community members in real-time.</p>
                  </div>
                </div>
                <div className="relative flex-1 overflow-scoll">
                  <div className="absolute inset-0">
                    <div className="h-full" aria-hidden="true">
                      {/** Chat feed */}
                      <Chat context={global.orbis_chat_context} />
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
