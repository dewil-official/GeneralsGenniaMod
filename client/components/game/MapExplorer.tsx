import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Tab,
  Tabs,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { CustomMapInfo } from '@/lib/types';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AspectRatioRounded } from '@mui/icons-material';

interface MapExplorerProps {
  userId: string;
  onSelect?: (mapId: string) => void;
}

export default function MapExplorer({ userId, onSelect }: MapExplorerProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [maps, setMaps] = useState<CustomMapInfo[] | null>(null);
  const router = useRouter();

  const [starredMaps, setStarredMaps] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (!userId) return;
    const fetchStarredMaps = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/starredMaps?userId=${userId}`
      );
      const data: string[] = await response.json();

      const starredMaps = data.reduce(
        (acc: { [key: string]: boolean }, mapId: string) => {
          acc[mapId] = true;
          return acc;
        },
        {}
      );
      setStarredMaps(starredMaps);
    };

    fetchStarredMaps();
  }, [userId]);

  const fetchMaps = async () => {
    const endpoint = ['new', 'hot', 'best', 'search'][tabIndex];
    const url = `${process.env.NEXT_PUBLIC_SERVER_API}/${endpoint}${
      tabIndex === 3 ? `?q=${searchTerm}` : ''
    }`;
    const response = await fetch(url);
    const data = await response.json();
    setMaps(data);
  };

  useEffect(() => {
    fetchMaps();
  }, [tabIndex, searchTerm]);

  const handleStarClick = async (mapId: string) => {
    const action = starredMaps[mapId] ? 'decrease' : 'increase';

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/toggleStar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          mapId,
          action,
        }),
      }
    );

    const data = await response.json();

    // fix: high latency
    if (data.success) {
      setStarredMaps({
        ...starredMaps,
        [mapId]: action === 'increase',
      });
    }
    fetchMaps();
  };

  const handleTabChange = (event: any, newValue: any) => {
    setTabIndex(newValue);
  };

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ height: '500px', overflow: 'auto' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label='basic tabs example'
        >
          <Tab label='New' />
          <Tab label='Hot' />
          <Tab label='Best' />
          <Tab label='Search' />
        </Tabs>
      </Box>
      {tabIndex === 3 && (
        <TextField
          label='Search'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      )}
      {maps &&
        maps.map((map) => (
          <Card className='menu-container' key={map.id} sx={{ my: 2 }}>
            <CardContent>
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='h5'>{map.name}</Typography>
                <IconButton>
                  <VisibilityIcon />
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    {map.views}
                  </Typography>
                </IconButton>
                <IconButton onClick={() => handleStarClick(map.id)}>
                  <StarIcon
                    color={starredMaps[map.id] ? 'primary' : 'inherit'}
                  />
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    {map.starCount}
                  </Typography>
                </IconButton>
              </Box>

              <Box display='flex' alignItems='center'>
                <AspectRatioRounded sx={{ ml: 1 }} />
                <Typography variant='body2' sx={{ ml: 1 }}>
                  {map.width} x {map.height}
                </Typography>
              </Box>

              <Typography variant='body2'>
                Created by {map.creator} on{' '}
                {new Date(map.createdAt).toLocaleDateString()}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {map.description}
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={() => router.push(`/maps/${map.id}`)}
              >
                View Map
              </Button>
              {onSelect && (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    onSelect(map.id);
                  }}
                >
                  Select Map
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
    </Box>
  );
}
