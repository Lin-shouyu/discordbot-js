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
import { Paragraph } from 'app/components/Typography';
import React, { useState, useEffect } from 'react';
import axios from 'axios.js';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
const CardHeader = styled(Box)(() => ({
  display: 'flex',
  paddingLeft: '24px',
  paddingRight: '24px',
  marginBottom: '12px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Title = styled('span')(() => ({
  fontSize: '1rem',
  fontWeight: '500',
  textTransform: 'capitalize',
}));

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

const Small = styled('small')(({ bgcolor }) => ({
  width: 50,
  height: 15,
  color: '#fff',
  padding: '2px 8px',
  borderRadius: '4px',
  overflow: 'hidden',
  background: bgcolor,
  boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
}));



const DOCUMENT_home = () => {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;
  const { get_info, base_url } = require('../../../../config.json');
  const [data, setData] = useState(null);
  const [data2, setData2] = useState(null);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
const [selectedCategory, setSelectedCategory] = useState("all_categories");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await axios.get(`${base_url}/api/get/docinfo_dep`);
        setData(studentsResponse.data.docinfos);
        setData2(studentsResponse.data2);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, []);

  const handleSort = (column) => {
    setSortColumn(column);
    setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
  };

const handleDownload = async (docName, depname) => {
  // 构建下载链接
  const downloadUrl = `${base_url}/api/download/doc/${encodeURIComponent(docName)}/${encodeURIComponent(depname)}`;
  

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


  const sortedData = Array.isArray(data) ? [...data].sort((a, b) => {
    if (sortColumn) {
      const comparison = a[sortColumn].localeCompare(b[sortColumn]);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    return 0;
  }) : [];

  if (!data || !setData  ) {
    return <div>Loading...</div>; // or any other fallback UI
  }

  return (
    <Card elevation={3} sx={{ pt: '20px', mb: 3 }}>
      <CardHeader>
        <Title>Document</Title>
      </CardHeader>
      <Box overflow="auto">
        <ProductTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }} colSpan={2} onClick={() => handleSort('DocName')}>
                DocName
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2} onClick={() => handleSort('DepName')}>
                DepName
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2} onClick={() => handleSort('UserName')}>
                Recorder
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2} onClick={() => handleSort('CreatedTime')}>
                CreatedTime
              </TableCell>
              <TableCell sx={{ px: 0 }}>Download</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((doc) => (
              <TableRow key={doc.DocName} hover>

                <TableCell
                  align="left"
                  colSpan={2}
                  sx={{
                    px: 0,
                    textTransform: 'capitalize',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Link to={`/edit/${encodeURIComponent(doc.DepName)}/${encodeURIComponent(doc.DocName)}`} style={{ textDecoration: 'inherit', color: 'inherit' }}>
                    {doc.DocName}
                  </Link>
                </TableCell>
                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.DepName}
                </TableCell>
                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.UserName}
                </TableCell>
                 <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.CreatedTime}
                </TableCell>
                <TableCell align="left" sx={{ px: 0 }}>
                  <a href="#" onClick={() => handleDownload(doc.DocName, doc.DepName)}>
                    Download
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>
      </Box>
    </Card>
  );
};

export default DOCUMENT_home;

