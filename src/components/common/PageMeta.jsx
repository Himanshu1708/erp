import { Title, Meta } from "react-head";

const PageMeta = ({ title, description }) => (
  <>
    <Title>{title}</Title>
    <Meta name="description" content={description} />
  </>
);

export default PageMeta;
