import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useOrbis, User, AccessRulesModal, checkContextAccess } from "@orbisclub/components";
import ReactTimeAgo from 'react-time-ago'
import Link from 'next/link';
import { shortAddress, getIpfsLink, getTimestamp, sleep } from "../utils";
import { useRouter } from 'next/router';
import { ExternalLinkIcon, LinkIcon, CodeIcon, LoadingCircle } from "./Icons";
import ArticleContent from "./ArticleContent";

const Editor = ({post}) => {
  const { orbis, user, credentials } = useOrbis();
  const router = useRouter();
  const [title, setTitle] = useState(post?.content?.title ? post.content.title : "");
  const [body, setBody] = useState(post?.content?.body ? post.content.body : "");
  const [media, setMedia] = useState(post?.content?.media ? post.content.media : []);
  const [category, setCategory] = useState(post?.content?.context ? post.content.context : "");
  const [categoryAccessRules, setCategoryAccessRules] = useState([]);
  const [accessRulesLoading, setAccessRulesLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessRulesModalVis, setAccessRulesModalVis] = useState(false);
  const [status, setStatus] = useState(0);
  const [toolbarStyle, setToolbarStyle] = useState({});
  const [storedSelectionStart, setStoredSelectionStart] = useState(0);
  const [storedSelectionEnd, setStoredSelectionEnd] = useState(0);

  /** Views:
   * 0: Editor
   * 1: End-result
   */
  const [view, setView] = useState(0);
  const textareaRef = useRef();

  /** Will load the details of the context and check if user has access to it  */
  useEffect(() => {
    if(category && category != "") {
      loadContextDetails();
    }

    async function loadContextDetails() {
      setAccessRulesLoading(true);
      setHasAccess(false)
      let { data, error } = await orbis.getContext(category);
      if(data && data.content) {
        /** Save context access rules in state */
        setCategoryAccessRules(data.content.accessRules ? data.content.accessRules : []);

        /** Now check if user has access */
        if(!data.content.accessRules || data.content.accessRules.length == 0) {
          setHasAccess(true)
        } else {
          checkContextAccess(user, credentials, data.content?.accessRules, () => setHasAccess(true));
        }

      }
      setAccessRulesLoading(false);
    }
  }, [category, credentials]);

  /** Triggered on component launch */
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Will store the current selection and save in state to make sure we don't lose it when the textarea loses focus because of a click in the format toolbar */
  const storeSelection = () => {
    const { selectionStart, selectionEnd } = textareaRef.current;
    if(selectionStart) {
      setStoredSelectionStart(selectionStart);
    }
    if(selectionEnd) {
      setStoredSelectionEnd(selectionEnd);
    }
  };

  /** Will be triggered on scroll to update the toolbar style */
  const handleScroll = () => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      if (rect.top < 0) {
        setToolbarStyle({ position: 'fixed', top: 0, marginLeft: 8 });
      } else {
        setToolbarStyle({});
      }
    }
  };


  /** Will update title field */
  const handleTitleInputChange = (e) => {
    setTitle(e.target.value);
  };

  /** Will update the body field */
  const handleInputChange = (e) => {
    setBody(e.target.value);
  };

  const wrapWith = (before, after, newText) => {
    const { value, selectionStart, selectionEnd } = textareaRef.current;
    let selectedText = newText !== undefined ? newText : value.substring(selectionStart, selectionEnd);

    setBody(
      value.substring(0, selectionStart) +
        before +
        selectedText +
        after +
        value.substring(selectionEnd)
    );

    // Store the current scroll position
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        selectionStart + before.length,
        selectionEnd + before.length
      );

      // Restore the scroll position (this is useful to avoid the page to scroll back-up on state/selection update)
      window.scrollTo(currentScrollX, currentScrollY);
    }, 0);
  };

  // Helper function to toggle formatting
  const toggleFormat = (delimiterStart, delimiterEnd, patternStart, patternEnd) => {
    const { value } = textareaRef.current;
    const beforeSelection = value.substring(0, storedSelectionStart);
    const afterSelection = value.substring(storedSelectionEnd);
    const selectedText = value.substring(storedSelectionStart, storedSelectionEnd);

    const isFormatted =
      (patternStart.test(beforeSelection) && patternEnd.test(afterSelection)) ||
      (patternStart.test(beforeSelection.slice(-3)) && patternEnd.test(afterSelection.slice(-3)));

    if (isFormatted) {
      const newText =
        beforeSelection.replace(patternStart, '') +
        selectedText +
        afterSelection.replace(patternEnd, '');
      setBody(newText);
    } else {
      wrapWith(delimiterStart, delimiterEnd);
    }
  };

  // Toolbar actions
  const addBold = () => {
    const delimiter = '**';
    const patternStart = /(\*\*|__)$/;
    const patternEnd = /^(\*\*|__)/;
    toggleFormat(delimiter, delimiter, patternStart, patternEnd);
  };

  const addItalic = () => {
    const delimiter = '_';
    const patternStart = /(_)$/;
    const patternEnd = /^(_)/;
    toggleFormat(delimiter, delimiter, patternStart, patternEnd);
  };

  const addCodeBlock = () => {
    const { value } = textareaRef.current;
    const selectedText = value.substring(storedSelectionStart, storedSelectionEnd);

    if (selectedText.includes('\n')) {
      // Multi-line code block
      const delimiterStart = '```\n';
      const delimiterEnd = '\n```';
      const patternStart = /(```)$/;
      const patternEnd = /^(```)/;
      toggleFormat(delimiterStart, delimiterEnd, patternStart, patternEnd);
    } else {
      // Single-line code block
      const delimiter = '`';
      const patternStart = /(`)$/;
      const patternEnd = /^(`)/;
      toggleFormat(delimiter, delimiter, patternStart, patternEnd);
    }
  };

  const addHeading1 = () => wrapWith('# ', '');
  const addHeading2 = () => wrapWith('## ', '');
  const addHeading3 = () => wrapWith('### ', '');
  const addLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      wrapWith('[', `](${url})`);
    }
  };
  /** To add a photo to the blog post */
  const addImage = async (event) => {
    const file = event.target.files[0];

    if (file && file.type.match(/^image\//)) {
      let res = await orbis.uploadMedia(file);
      if(res.status == 200) {
        const imgTag = `![Image ALT tag](${getIpfsLink(res.result)})`;
        const { value } = textareaRef.current;
        setBody(
          value.substring(0, storedSelectionStart) +
            imgTag +
            value.substring(storedSelectionEnd)
        );
      } else {
        alert("Error uploading image.");
      }
    } else {
      console.log("There isn't any file to upload.");
    }
  };

  /** Will edit the post to publish the new version */
  async function updateArticle() {
    setStatus(1);
    let res;
    if(post) {
      let _content = {...post.content};
      let _data = {...post.content.data};
      _content.title = title;
      _content.body = body;
      _content.data = _data;
      _content.media = media;
      _content.context = category ? category : global.orbis_context;
      res = await orbis.editPost(post.stream_id, _content);
      console.log("Post updated?", res);
    } else {
      res = await orbis.createPost({
        title: title,
        body: body,
        context: category ? category : global.orbis_context,
        media: media
      });
      console.log("Post created", res);
    }

    if(res.status == 200) {
      setStatus(2);
      await sleep(1500);
      router.push("/post/" + res.doc);
    } else {
      setStatus(3);
      await sleep(2500);
      setStatus(0);
    }
  }

  /** Used to upload the main image to IPFS and save it in state */
  const uploadMainImage = async (event) => {
    const file = event.target.files[0];

    if (file && file.type.match(/^image\//)) {
      let res = await orbis.uploadMedia(file);
      if(res.status == 200) {
        setMedia([res.result])
      } else {
        alert("Error uploading image.");
      }
    }
  };

  return (
    <div className="container mx-auto text-gray-900">

      {/** Loop categories */}
      <Categories category={category} setCategory={setCategory} />

      {/** Update view */}
      {(category && category != "") &&
        <div className="flex flex-row mb-4">
          <div className="flex flex-1">
            <button className={`btn ${view == 0 ? "btn-brand-400" : ""}`} onClick={() => setView(0)}>Editor</button>
            {/** Show preview button only if user started typing a title */}
            {title && title != "" &&
              <button className={`btn ${view == 1 ? "btn-brand-400" : ""}`} onClick={() => setView(1)}>Preview</button>
            }

          </div>
          {post &&
            <Link href={"/post/" + post.stream_id} className={`btn items-center flex flex-row`}><ExternalLinkIcon style={{marginRight: 4}} /> View live</Link>
          }
        </div>
      }

      {/** Post Editor or Loading state */}
      {view == 0 &&
        <div className="w-full">
          {accessRulesLoading ?
            <div className="p-6 w-full flex justify-center text-gray-900">
              <LoadingCircle />
            </div>
          :
            <div>
              {/** Render text inputs only if the category has been selected */}
              {(category && category != "") &&
                <>
                  {/** If user has access we disply the form */}
                  {hasAccess ?
                    <>
                      {/** Title */}
                      <TextareaAutosize
                        ref={textareaRef}
                        className="resize-none w-full h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="Type your title here"
                        value={title}
                        onChange={handleTitleInputChange} />

                      {/** Formatting toolbar container */}
                      <div className="flex -mb-px mt-4 space-x-2 items-center z-10 bg-gray-50 rounded-t-md border border-gray-300 p-1" style={toolbarStyle}>
                        <ToolbarButton label="B" onClick={addBold} />
                        <ToolbarButton label="I" onClick={addItalic} />
                        <ToolbarButton label="H2" onClick={addHeading2} />
                        <ToolbarButton label="H3" onClick={addHeading3} />
                        <ToolbarButton label={<CodeIcon />} onClick={addCodeBlock} />
                        <ToolbarButton label={<LinkIcon />} onClick={addLink} />
                        <ToolbarButton isImage={true} label={<ImageIcon />} onClick={addImage} />
                      </div>

                      {/** Actual content of the blog post */}
                      <TextareaAutosize
                        ref={textareaRef}
                        className="resize-none w-full h-full p-3 border border-gray-300 rounded-b-md min-height-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="Write your post content here..."
                        value={body}
                        onBlur={storeSelection}
                        onChange={handleInputChange}
                      />

                      {/** Default status */}
                      {status == 0 &&
                        <>
                          {((post && (!user || user.did != post.creator))) ?
                            <div className="flex mt-4 justify-center">
                              <div className="text-gray-600 flex flex-row items-center">Only <div className="ml-2 mr-2 text-gray-900"><User height={30} hover={true} details={post.creator_details} /></div> can update this article.</div>
                            </div>
                          :
                            <button className="btn-sm w-full btn-brand btn-brand-hover mt-2" onClick={() => updateArticle()}>{post ? "Update" : "Share"}</button>
                          }
                        </>
                      }

                      {/** Loading status */}
                      {status == 1 &&
                        <button className="btn-sm w-full bg-brand bg-brand-hover mt-2">Loading...</button>
                      }

                      {/** success status */}
                      {status == 2 &&
                        <button className="btn-sm w-full text-slate-100 bg-green-500 mt-2">Success</button>
                      }
                    </>
                  :
                    <div className="w-full text-center bg-[#F9FAFB] rounded border border-slate-200 p-6">
                      <p className="text-base text-secondary mb-2">You can&apos;t share a post in this category as it&apos;s restricted to certain rules that you do not meet.</p>
                      <button className="btn-sm py-1.5 btn-brand" onClick={() => setAccessRulesModalVis(true)}>View rules</button>
                    </div>
                  }
                </>
              }
            </div>
          }

        </div>
      }

      {/** Show live article view */}
      {view == 1 &&
        <ArticleContent post={{
          stream_id: post ? post.stream_id : null,
          timestamp: post ? post.timestamp : getTimestamp(),
          creator_details: user,
          content: {
            title: title,
            body: body,
            media: media[0]
          }
        }} />
      }

      {/** Display more details about the access rules required for this context */}
      {accessRulesModalVis &&
        <AccessRulesModal accessRules={categoryAccessRules} hide={() => setAccessRulesModalVis(false)} />
      }
    </div>
  );
};

/** Will loop through all categories and display them */
const Categories = ({category, setCategory}) => {
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
    <div className="flex flex-col mt-2 mb-4 items-center text-sm">
      <span className="text-primary font-medium text-base">Which category do you want to share your post into?</span>
      <div className="flex flex-row flex-wrap space-x-2 mt-2">
        {categories.map((cat) => {
          return (
            <div className={`flex flex-row btn rounded-full py-1.5 px-3 cursor-pointer ${(category == cat.stream_id) ? "bg-blue-100 border border-blue-400" : "bg-white border border-slate-300 hover:border-slate-400 bg-slate-50 text-gray-900" }`} key={cat.stream_id} onClick={() => setCategory(cat.stream_id)}>{cat.content.displayName}</div>
          );
        })}
      </div>
    </div>
  );
}

/** Simple component to handle the buttons in the toolbar */
const ToolbarButton = ({label, onClick, isImage}) => {
  if(isImage == true) {
    return(
      <>
        <input
          type="file"
          id="imageInputPost"
          className="hidden"
          accept="image/*"
          onChange={onClick} />
        <label htmlFor="imageInputPost"
          className="btn btn-primary font-medium rounded-md hover:bg-gray-50 px-2 py-1"
          title="Add Image">{label}</label>
      </>
    )
  } else {
    return(
      <button
        className="btn btn-primary font-medium rounded-md hover:bg-gray-100 px-2 py-1"
        onClick={onClick}>
        {label}
      </button>
    )
  };
}

const ImageIcon = () => {
  return(
    <svg width="17" height="13" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.82689 3.1749C5.46581 3.75354 4.86127 4.13398 4.186 4.22994C3.80655 4.28386 3.42853 4.34223 3.05199 4.40497C1.99912 4.58042 1.25 5.50663 1.25 6.57402V15C1.25 16.2426 2.25736 17.25 3.5 17.25H18.5C19.7426 17.25 20.75 16.2426 20.75 15V6.57403C20.75 5.50664 20.0009 4.58042 18.948 4.40498C18.5715 4.34223 18.1934 4.28387 17.814 4.22995C17.1387 4.13398 16.5342 3.75354 16.1731 3.17491L15.3519 1.85889C14.9734 1.25237 14.3294 0.858383 13.6155 0.820048C12.7496 0.773548 11.8775 0.75 11 0.75C10.1225 0.75 9.25044 0.773548 8.3845 0.820048C7.6706 0.858383 7.02658 1.25237 6.64809 1.85889L5.82689 3.1749Z" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.5 9.75C15.5 12.2353 13.4853 14.25 11 14.25C8.51472 14.25 6.5 12.2353 6.5 9.75C6.5 7.26472 8.51472 5.25 11 5.25C13.4853 5.25 15.5 7.26472 15.5 9.75Z" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.75 7.5H17.7575V7.5075H17.75V7.5Z" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

export default Editor;
