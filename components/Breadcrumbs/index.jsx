import style from "./index.module.css"
import Link from "../Link";

/***
 *
 * @param path {string}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Breadcrumbs({ path }) {

  path = `home/${path}`
  const pathSteps = path.split("/").filter(s => s !== "")

  const parentPath = pathSteps.slice(0, -1);
  const currentLocation = pathSteps.slice(-1);

  return <div style={{
    marginLeft: "10%",
    display: pathSteps.length > 1 || "none"
  }} className={style["breadcrumb-container"]}>
    {parentPath.map((item, i) =>
      <div className={style["breadcrumb-path-item"]}>
        <Link href={"/" + path.split("/").slice(0, i).join("/")}>
          {item}
        </Link>
        <i className={style["breadcrumb-icon"]} />
      </div>
    )}
    <div className={style["breadcrumb-current-location"]}>
      {currentLocation}
    </div>
  </div>
}