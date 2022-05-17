import {useEffect, useState} from "react";
import CustomComponent from "../components/CustomComponent";

export default function TestPage() {
  return <>
    <CustomComponent customComponentName="Counter" />
    <CustomComponent customComponentName="Greeter" message="Hello World from the Greeter!" />
  </>
}