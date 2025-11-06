import { memo } from 'react';
import sanitizeHtml from 'sanitize-html';

interface HTMLStringProps {
  htmlString: string;
}

const HtmlString = memo(
  ({ htmlString }: HTMLStringProps): React.ReactElement => {
    const sanitizedHTML = sanitizeHtml(htmlString, {
      allowedTags: sanitizeHtml.defaults.allowedTags,
      allowedAttributes: {},
    });

    return (
      <div
        className="overflow-y-auto text-white md:w-full"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  }
);

HtmlString.displayName = 'HtmlString';

export default HtmlString;
