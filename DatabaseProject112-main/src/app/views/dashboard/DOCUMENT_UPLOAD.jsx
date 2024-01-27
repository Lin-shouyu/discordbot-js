import { Card, Grid, styled, useTheme,Box } from '@mui/material';
import { Fragment } from 'react';
import DOCUMENT_upload from './shared/DOCUMENT_upload';
import { Breadcrumb, SimpleCard } from "app/components";



const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));


const DOCUMENT_UPLOAD = () => {
  const { palette } = useTheme();

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "DOCUMENT", path: "/dashboard/default" }, { name: "UPLOAD DOCUMENT" }]} />
      </Box>

      <SimpleCard title=" Upload Document ">
        <DOCUMENT_upload />
      </SimpleCard>


    </Container>
  );
};

export default DOCUMENT_UPLOAD;

