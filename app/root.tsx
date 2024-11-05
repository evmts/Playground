import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Head } from "./Head";
import { Body } from "./Body";

export const loader: LoaderFunction = async () => {
  return json({});
};

export default function Html() {
  return (
    <html className="h-full">
      <Head />
      <Body />
    </html>
  );
}

