import { forwardRef, createElement, ReactNode } from "react";

// a small utility function to create compoenents with a classname and a tagname
// element specific props?
// how can I have conditional classNames
// with classnames optional this should allow for conditional class names

// https://www.anycodings.com/1questions/1770567/typing-a-dynamic-tag-in-react-with-typescript

type Props<Tag extends keyof JSX.IntrinsicElements> = {
  // tag?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
} & JSX.IntrinsicElements[Tag];

// a simple function to create simple components with default props
// this is useful for elements that will have static classes and will only be used with one tag type
// this also makes updating classNames easier especially if that classname is used across multiple files
export const createComponent = <Tag extends keyof JSX.IntrinsicElements = 'div'>(
  defaultProps: JSX.IntrinsicElements[Tag] = {},
  tagName?: Tag,
) => {
  return forwardRef((props: Props<Tag>, ref) => {
    // ?? operator
    return createElement(tagName || "div", { ...props, ...defaultProps, ref });
  });
};

export const Empty = createComponent({ className: "empty-container" }); // might rename this to CenterContainer
export const ErrorMessage = createComponent({ className: "error-message"});
export const Heading = createComponent({ className: "heading"}, "h1");
export const ModalBody = createComponent({ className: "modal-body" });
