import { Card, Grid, styled, useTheme,Box } from '@mui/material';
import { Fragment } from 'react';
import { Breadcrumb, SimpleCard } from "app/components";
import DOCUMENT from './shared/DOCUMENT_home';



const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));


const DOCUMENT_HOME = () => {
  const { palette } = useTheme();

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "DOCUMENT", path: "/dashboard/default" }]} />
      </Box>
       <DOCUMENT />
    </Container>
  );
};

export default DOCUMENT_HOME;


