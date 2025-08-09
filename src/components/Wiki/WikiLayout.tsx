import React, { useState, useEffect } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemText, ListItemIcon, Collapse, Divider, Button, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { Menu as MenuIcon, ExpandLess, ExpandMore, Article, Folder, Add, Search } from '@mui/icons-material';
import { useRouter } from 'next/router';
import WikiService, { WikiPage, WikiCategory } from '@/services/wiki';

interface WikiLayoutProps {
  children: React.ReactNode;
  teamId: number;
}

const drawerWidth = 280;

const WikiLayout: React.FC<WikiLayoutProps> = ({ children, teamId }) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWikiData();
  }, [teamId]);

  const loadWikiData = async () => {
    try {
      setLoading(true);
      const [pagesData, categoriesData] = await Promise.all([
        WikiService.getPages(teamId, { rootOnly: true }),
        WikiService.getCategories(teamId, { rootOnly: true })
      ]);
      setPages(pagesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load wiki data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePageClick = (page: WikiPage) => {
    router.push(`/wiki/${page.slug}`);
  };

  const handleNewPage = () => {
    router.push('/wiki/new');
  };

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      try {
        const searchResults = await WikiService.getPages(teamId, { search: term });
        setPages(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else if (term.length === 0) {
      loadWikiData();
    }
  };

  const renderPageItem = (page: WikiPage, level = 0) => (
    <ListItem
      key={page.id}
      component="button"
      onClick={() => handlePageClick(page)}
      sx={{ pl: 2 + level * 2, cursor: 'pointer' }}
    >
      <ListItemIcon>
        <Article fontSize="small" />
      </ListItemIcon>
      <ListItemText 
        primary={page.title}
        primaryTypographyProps={{ fontSize: '0.9rem' }}
      />
    </ListItem>
  );

  const renderCategoryItem = (category: WikiCategory, level = 0) => {
    // Prevent infinite recursion by limiting nesting depth
    const maxDepth = 5;
    const isExpanded = expandedCategories.includes(category.id);
    
    return (
      <React.Fragment key={category.id}>
        <ListItem
          component="button"
          onClick={() => handleCategoryToggle(category.id)}
          sx={{ pl: 2 + level * 2, cursor: 'pointer' }}
        >
          <ListItemIcon>
            <Folder fontSize="small" sx={{ color: category.color || 'inherit' }} />
          </ListItemIcon>
          <ListItemText 
            primary={category.name}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
          />
          {category.children && category.children.length > 0 && level < maxDepth && (
            isExpanded ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItem>
        {category.children && category.children.length > 0 && level < maxDepth && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {category.children.map(child => renderCategoryItem(child, level + 1))}
            </List>
          </Collapse>
        )}
        {level >= maxDepth && category.children && category.children.length > 0 && (
          <ListItem sx={{ pl: 2 + (level + 1) * 2 }}>
            <ListItemText 
              primary="..."
              primaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
            />
          </ListItem>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Wiki
        </Typography>
      </Toolbar>
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar páginas..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ px: 2, pb: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewPage}
          size="small"
        >
          Nova Página
        </Button>
      </Box>

      <Divider />

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List>
          {categories.map(category => renderCategoryItem(category))}
          {pages.filter(page => !page.parentId).map(page => renderPageItem(page))}
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Wiki
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default WikiLayout;