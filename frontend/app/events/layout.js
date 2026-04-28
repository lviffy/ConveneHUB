import { EventsHeader } from "@/components/events-header";
export default function EventsLayout({
  children
}) {
  return React.createElement(React.Fragment, null, React.createElement(EventsHeader, null), children);
}