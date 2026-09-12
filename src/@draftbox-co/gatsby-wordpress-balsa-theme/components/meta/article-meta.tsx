/**
 * Spidernet shadow of @draftbox-co/gatsby-wordpress-balsa-theme's article-meta
 * (Phase 1 patch — copy this file to the same path in each Draftbox site repo).
 *
 * Posts published by Spidernet already carry validated JSON-LD (an Article with
 * the real author) in their content. For those posts the theme's generic Article
 * — author = the WordPress user, e.g. "spiderus_admin" — is not emitted, so each
 * page has one consistent Article. All other meta tags are unchanged.
 * Also emits ISO 8601 dates in the theme's own Article (it used "September 03 2026").
 */
import React from "react";
import Helmet from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import url from "url";
import _ from "lodash";

// Spidernet JSON-LD in the post body that already describes the article. Older
// posts may carry wpautop <br /> inside the block, so scan up to its </script>.
const CONTENT_ARTICLE_LD = /<script[^>]*application\/ld\+json[^>]*>(?:(?!<\/script>)[\s\S])*?"@type"\s*:\s*"(?:Article|BlogPosting|NewsArticle)"/;

const capitalize = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const toIso = (value: string | undefined) => {
  const d = new Date(value || "");
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

type ArticleMetaProps = {
  data: any;
  amp: boolean;
  location: any;
};

const ArticleMeta: React.FC<ArticleMetaProps> = ({ data, amp, location }) => {
  const queryData = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
          siteTitle
          metadata {
            title
            description
          }
          twitterCard {
            title
            description
            imageUrl
            username
          }
          facebookCard {
            title
            description
            imageUrl
            appId
          }
          siteDescription
          language
          logoUrl
          iconUrl
          coverUrl
          alternateLogoUrl
          shareImageWidth
          shareImageHeight
        }
      }
    }
  `);
  const config = queryData.site.siteMetadata;
  const canonicalUrl = url.resolve(config.siteUrl, location.pathname);
  const feature_image = data.featured_media?.localFile?.seo?.fixed.src;

  const facebookImageUrl = feature_image
    ? url.resolve(config.siteUrl, feature_image)
    : config.facebookCard.imageUrl
    ? url.resolve(config.siteUrl, config.facebookCard.imageUrl)
    : config.coverUrl
    ? url.resolve(config.siteUrl, config.coverUrl)
    : null;

  const twitterImageUrl = feature_image
    ? url.resolve(config.siteUrl, feature_image)
    : config.twitterCard.imageUrl
    ? url.resolve(config.siteUrl, config.twitterCard.imageUrl)
    : config.coverUrl
    ? url.resolve(config.siteUrl, config.coverUrl)
    : null;

  const author = data.author;
  const publicTags = _.map(data.tags, (tag: any) => tag.name);
  const primaryTag = publicTags[0] || ``;
  const shareImage = feature_image
    ? url.resolve(config.siteUrl, feature_image)
    : config.coverUrl || config.facebookCard.imageUrl || config.twitterCard.imageUrl
    ? url.resolve(config.siteUrl, config.coverUrl || config.facebookCard.imageUrl || config.twitterCard.imageUrl)
    : null;
  const publisherLogo =
    config.logoUrl || config.alternateLogoUrl
      ? url.resolve(config.siteUrl, config.logoUrl || config.alternateLogoUrl)
      : null;

  const hasSpidernetArticle = CONTENT_ARTICLE_LD.test(data.content || "");

  const jsonLd = {
    "@context": `https://schema.org/`,
    "@type": `Article`,
    author: author
      ? {
          "@type": `Person`,
          name: author.name,
        }
      : undefined,
    keywords: publicTags.length ? publicTags.join(`, `) : undefined,
    headline: data.plainTitle || config.siteTitle,
    url: canonicalUrl,
    datePublished: toIso(data.date),
    dateModified: toIso(data.modified),
    image: shareImage
      ? {
          "@type": `ImageObject`,
          url: shareImage,
          width: config.shareImageWidth,
          height: config.shareImageHeight,
        }
      : undefined,
    publisher: {
      "@type": `Organization`,
      name: config.siteTitle,
      logo: publisherLogo
        ? {
            "@type": `ImageObject`,
            url: publisherLogo,
            width: 60,
            height: 60,
          }
        : undefined,
    },
    description: data.plainExcerpt || config.siteDescription,
    mainEntityOfPage: {
      "@type": `WebPage`,
      "@id": config.siteUrl,
    },
  };

  return (
    <>
      <Helmet>
        <title>{capitalize(data.plainTitle)}</title>
        {!amp && <link rel="ampHtml" href={`${canonicalUrl}/amp`} />}
        <meta name="description" content={data.plainExcerpt} />
        {!amp && <link rel="canonical" href={canonicalUrl} />}

        <meta property="og:site_name" content={config.siteTitle} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={data.plainTitle || config.siteTitle} />
        <meta property="og:description" content={data.plainExcerpt || config.siteDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="article:published_time" content={toIso(data.date)} />
        <meta property="article:modified_time" content={toIso(data.modified)} />
        {publicTags.map((keyword: string, i: number) => (
          <meta property="article:tag" content={keyword} key={i} />
        ))}

        {author && <meta property="article:author" content={author.name} />}

        <meta name="twitter:title" content={data.plainTitle || config.siteTitle} />
        <meta name="twitter:description" content={data.plainExcerpt || config.siteDescription} />
        <meta name="twitter:url" content={canonicalUrl} />
        {author && <meta name="twitter:label1" content="Written by" />}
        {author && <meta name="twitter:data1" content={author.name} />}
        {primaryTag && <meta name="twitter:label2" content="Filed under" />}
        {primaryTag && <meta name="twitter:data2" content={primaryTag} />}

        {twitterImageUrl && <meta name="twitter:card" content="summary_large_image" />}
        {twitterImageUrl && <meta name="twitter:image" content={twitterImageUrl} />}
        {facebookImageUrl && <meta property="og:image" content={facebookImageUrl} />}
        {config.twitterCard.username && <meta name="twitter:site" content={config.twitterCard.username} />}
        {config.facebookCard.appId !== "" && <meta property="fb:app_id" content={config.facebookCard.appId} />}
        {!hasSpidernetArticle && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>
    </>
  );
};

export default ArticleMeta;
