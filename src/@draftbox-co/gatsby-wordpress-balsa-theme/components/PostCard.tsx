import React from "react";
import { Link, navigate } from "gatsby";
import Img from "gatsby-image";

type PostCardTypes = {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    plainExcerpt?: string;
    date: string;
    sticky?: boolean;
    featured_media?: {
      localFile?: {
        childImageSharp?: {
          fluid: any;
        };
        publicURL?: string;
      };
    };
    tags?: Array<{ slug: string; name: string }>;
    author: {
      name: string;
      slug: string;
    };
    readingTime?: string;
  };
};

const PostCard: React.FC<PostCardTypes> = ({ post }) => {
  const handleNavigation = (e: any, slug: string) => {
    e.stopPropagation();
    navigate(slug);
  };

  let excerpt = "";

  if (post.plainExcerpt) {
    excerpt =
      post.plainExcerpt.split(" ").length > 30
        ? post.plainExcerpt.split(" ").slice(0, 30).join(" ") + "..."
        : post.plainExcerpt;
  }

  // Safely check for featured image availability
  const hasFluidImage = post.featured_media?.localFile?.childImageSharp?.fluid;
  const hasPublicURL = post.featured_media?.localFile?.publicURL;

  return (
    <div
      onClick={(e) => handleNavigation(e, `/${post.slug}`)}
      className="w-full lg:w-1/3 px-4 mb-8 cursor-pointer relative"
    >
      {post.sticky && (
        <span
          className="absolute bg-white rounded-full px-2 py-1 text-xs font-sansMedium z-10 flex items-center"
          style={{ right: "20px", top: "5px" }}
        >
          <span className="mr-1">*</span>
          Featured
        </span>
      )}
      <div className="h-full rounded shadow-md flex flex-col justify-between hover:shadow-2xl">
        <div>
          {hasFluidImage && (
            <Img
              className="mb-4 h-48 w-full object-cover rounded-t"
              fluid={post.featured_media!.localFile!.childImageSharp!.fluid}
            />
          )}
          {!hasFluidImage && hasPublicURL && (
            <img
              className="mb-4 h-48 w-full object-cover rounded-t"
              src={post.featured_media!.localFile!.publicURL}
              alt={post.title}
            />
          )}
          {!hasFluidImage && !hasPublicURL && (
            <div
              className="flex justify-center bg-primary items-center text-white font-sansBold mb-4 h-48 w-full object-cover rounded-t"
              style={{
                fontSize: "6rem",
              }}
              dangerouslySetInnerHTML={{ __html: post.title[0] }}
            ></div>
          )}

          <div className="px-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 break-words">
                {post.date}
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className="mx-2">-</span>
                    <span className="text-gray-600">
                      <a
                        onClick={(e) =>
                          handleNavigation(e, `/tag/${post.tags![0].slug}`)
                        }
                        className="no-underline hover:underline mr-2"
                      >
                        #{post.tags[0].name}
                      </a>
                    </span>
                  </>
                )}
              </p>
              <div className="my-2">
                <Link
                  to={`/${post.slug}`}
                  className="text-2xl my-2 font-sansSemibold tracking-tight leading-tight break-words"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                ></Link>
              </div>
              <p
                className="text-gray-600 font-serifLight break-words"
                dangerouslySetInnerHTML={{ __html: excerpt }}
              ></p>
            </div>
          </div>
        </div>
        <div className="my-4 flex justify-between px-6">
          <a
            onClick={(e) => handleNavigation(e, `/author/${post.author.slug}`)}
            className="text-gray-600 no-underline hover:underline"
          >
            <small>{post.author.name}</small>
          </a>
          {post.readingTime && (
            <small className="text-gray-600">{post.readingTime}</small>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
