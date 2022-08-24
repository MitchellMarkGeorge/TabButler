import { forwardRef, createElement, ReactNode } from "react";

// a small utility function to create compoenents with a classname and a tagname
// element specific props?
// how can I have conditional classNames
// with classnames optional this should allow for conditional class names

// https://www.anycodings.com/1questions/1770567/typing-a-dynamic-tag-in-react-with-typescript

type Props<Tag extends keyof JSX.IntrinsicElements> = {
  tag?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
} & JSX.IntrinsicElements[Tag];


export const createComponent = <Tag extends keyof JSX.IntrinsicElements = 'div'>(
  className?: string,
  tagName?: Tag,
) => {
  return forwardRef((props: Props<Tag>, ref) => {
    // ?? operator
    return createElement(tagName || "div", { ...props, className, ref });
  });
};

// what file should these components go to
export const Empty = createComponent("empty-container"); // might rename this to CenterContainer
export const ErrorMessage = createComponent("error-message");
export const Heading = createComponent("heading", "h1");
export const ModalBody = createComponent("modal-body");
