import axios from 'axios.js';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import axios from 'axios';
import {
  Avatar,
  Box,
  Card,
  Icon,
  IconButton,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { Breadcrumb, SimpleCard } from "app/components";
const ProductTable = styled(Table)(() => ({
  minWidth: 400,
  whiteSpace: 'pre',
  '& small': {
    width: 50,
    height: 15,
    borderRadius: 500,
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
  },
  '& td': { borderBottom: 'none' },
  '& td:first-of-type': { paddingLeft: '16px !important' },
}));

const Title = styled('span')(() => ({
  fontSize: '1rem',
  fontWeight: '500',
  textTransform: 'capitalize',
}));

const CardHeader = styled(Box)(() => ({
  display: 'flex',
  paddingLeft: '24px',
  paddingRight: '24px',
  marginBottom: '12px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));


const EditCourse = () => {
  const { dep_name, doc_name } = useParams();
  const [docInfos, setDocInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortByDate, setSortByDate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all_categories");
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState([]);
  const { get_info, base_url } = require('../../../config.json');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    setSortColumn(column);
    setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${base_url}/api/get/doc/${dep_name}/${doc_name}`);
        setDocInfos(response.data.docinfos);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [dep_name, doc_name]);

  const handleSortByDate = () => {
    setSortByDate(!sortByDate);
  };

  const sortedDocInfos = sortByDate
    ? [...docInfos].sort((a, b) => new Date(a.CreatedTime) - new Date(b.CreatedTime))
    : docInfos;


  const filteredCourses = data && data.docinfos
    ? selectedCategory === "all_categories"
      ? data.docinfos
      : data.docinfos.filter(docinfos => docinfos.CreatedTime === selectedCategory)
    : [];


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
const handleDownload = async (docName, depname, generation) => {
  // 构建下载链接
  const downloadUrl = `${base_url}/api/download/doc/${encodeURIComponent(docName)}/${encodeURIComponent(depname)}/${encodeURIComponent(generation)}`;

  try {
    // 使用 fetch 获取文件内容
    const response = await fetch(downloadUrl);
    const data = await response.json(); // 解析返回的 JSON 数据
    const blobUrl = data.download_url; // 获取签名 URL

    // 创建虚拟链接并模拟点击
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', docName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

  const fetchData2 = async () => {
    try {
      const response = await axios.get(`${base_url}/api/get/doc/${dep_name}/${doc_name}`);
      setData(response.data);
    } catch (err) {
      setError(err);
    }
  };
  const deleteUser = async (doc_name, depname, generation) => {
    try {
      await axios.delete(`${base_url}/api/delete/doc/${doc_name}/${depname}/${generation}`);
      fetchData2(); // Refresh the user list after deleting a user
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Home', path: '/dashboard/default' }, { name: 'UPLOAD DOCUMENT' }]} />
      </Box>

      <Card elevation={3} sx={{ pt: '20px', mb: 3 }}>
        <CardHeader>
        <Title>{doc_name}</Title>
          <Select size="small" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <MenuItem value="all_categories">All</MenuItem>
            {data && data.docinfos && Array.from(new Set(data.docinfos.map(doc => doc.CreatedTime))).map(CreatedTime => (
              <MenuItem key={CreatedTime} value={CreatedTime}>{CreatedTime}</MenuItem>
            ))}
          </Select>
        </CardHeader>
        <Box overflow="auto">
        <ProductTable>

          <TableHead>
              <TableRow>
                <TableCell sx={{ px: 3 }} colSpan={2}>
                  DocName
                </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2} onClick={() => handleSort('CreatedTime')}>
                CreatedTime
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2}>
                DepName
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2}>
                VersionNum
              </TableCell>
               <TableCell sx={{ px: 0 }} colSpan={1}>
                DOWNLOAD
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={1}>
                DELETE
              </TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((doc) => (
                <TableRow key={doc.DocName} hover>
                  <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize' }}>
                    {doc.DocName}
                  </TableCell>
                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize' }}>
                  {doc.CreatedTime}
                </TableCell>
                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize' }}>
                  {doc.DepName}
                </TableCell>
                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize' }}>
                  {doc.VersionNum}
                </TableCell>
                  <TableCell align="left" colSpan={1} sx={{ px: 0, textTransform: 'capitalize' }}>
                    <a href="#" onClick={() => handleDownload(doc.DocName, doc.DepName, doc.VersionNum)}>
                    Download
                  </a>
                </TableCell>
                  <TableCell align="left" colSpan={1} sx={{ px: 0, textTransform: 'capitalize' }}>
                  <IconButton onClick={() => deleteUser(doc.DocName, doc.DepName, doc.VersionNum)} color="error">
                    <Icon>delete</Icon> 
                  </IconButton>
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ProductTable>
        </Box>
      </Card>
    </Container>
  );
};

export default EditCourse;
