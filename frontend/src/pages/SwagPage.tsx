import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PageHeader from '../components/PageHeader';
import SwagCard from '../components/SwagCard';
import { usePoints } from '../context/PointsContext';
import api from '../services/api';

const swagItems = [
  { id: 1, emoji: '👕', name: 'MM Classic Tee', description: 'Premium cotton, unisex, embroidered logo', points: 150, category: 'apparel' },
  { id: 2, emoji: '🧥', name: 'Company Hoodie', description: 'Fleece hoodie, embroidered MM branding', points: 400, category: 'apparel' },
  { id: 3, emoji: '☕', name: 'Ceramic Mug', description: '350ml, microwave safe, glossy finish', points: 100, category: 'accessories' },
  { id: 4, emoji: '💻', name: 'Laptop Sleeve', description: 'Neoprene, fits 15" laptops, MM logo', points: 250, category: 'accessories' },
  { id: 5, emoji: '📔', name: 'Branded Notebook', description: 'A5, 200 pages, dot grid, hardcover', points: 80, category: 'stationery' },
  { id: 6, emoji: '📌', name: 'Enamel Pin Set', description: 'Set of 3 collectible MM enamel pins', points: 60, category: 'accessories' },
  { id: 7, emoji: '🧢', name: 'Snapback Cap', description: 'Structured snapback, embroidered', points: 120, category: 'apparel' },
  { id: 8, emoji: '🎨', name: 'Sticker Pack', description: '12 high-quality vinyl stickers', points: 30, category: 'stationery' },
];

function SwagPage() {
  const [selectedItem, setSelectedItem] = useState<typeof swagItems[number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { balance, setBalance, addOrder } = usePoints();

  const filteredItems = selectedCategory === 'all'
    ? swagItems
    : swagItems.filter(item => item.category === selectedCategory);

  const handleOpen = (item: typeof swagItems[number]) => setSelectedItem(item);
  const handleClose = () => setSelectedItem(null);

  const handleConfirm = async () => {
    if (!selectedItem || balance < selectedItem.points) return;
    handleClose();
    try {
      const res = await api.post('/api/swag_redemptions/redeem', {
        swag_item_name: selectedItem.name,
        points_cost: selectedItem.points,
      });
      setBalance(res.data.new_balance);
    } catch {
      // Backend unavailable — deduct locally so UI stays consistent
      setBalance(balance - selectedItem.points);
    }
    addOrder({ name: selectedItem.name, emoji: selectedItem.emoji });
  };

  return (
    <Box sx={{ pt: 10, pl: 3, pr: 3, pb: 4, minHeight: '100vh' }}>
      <PageHeader title="Swag Redemption Store" subtitle="Convert your recognition points into company merchandise." />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            { label: 'All Items', value: 'all' },
            { label: 'Apparel', value: 'apparel' },
            { label: 'Accessories', value: 'accessories' },
            { label: 'Stationery', value: 'stationery' },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={selectedCategory === tab.value ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(tab.value)}
              sx={{ borderRadius: 99, textTransform: 'none', minWidth: 0 }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          Balance: <Box component="span" sx={{ color: '#F59E0B', fontWeight: 700 }}>{balance} pts</Box>
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Box onClick={() => handleOpen(item)} sx={{ cursor: 'pointer' }}>
              <SwagCard emoji={item.emoji} name={item.name} description={item.description} points={item.points} disabled={balance < item.points} />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(selectedItem)} onClose={handleClose} PaperProps={{ sx: { bgcolor: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)' } }}>
        <DialogTitle sx={{ color: '#fff' }}>{selectedItem ? `Confirm Redemption: ${selectedItem.name}` : ''}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>{selectedItem?.description}</Typography>
          <Box sx={{ display: 'grid', gap: 1, bgcolor: '#141422', p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Item cost</Typography>
            <Typography sx={{ fontWeight: 700 }}>{selectedItem?.points} pts</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Your balance</Typography>
            <Typography sx={{ fontWeight: 700 }}>{balance} pts</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Balance after order</Typography>
            <Typography sx={{ fontWeight: 700, color: balance >= (selectedItem?.points ?? 0) ? '#10B981' : '#EF4444' }}>
              {balance - (selectedItem?.points ?? 0)} pts
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.15)', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirm} disabled={balance < (selectedItem?.points ?? 0)} sx={{ textTransform: 'none', background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}>
            Confirm Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SwagPage;
