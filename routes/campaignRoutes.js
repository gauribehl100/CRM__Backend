const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getAudiencePreview,
  getCampaignStats
} = require('../controllers/campaignController');
const { validateCampaign } = require('../middleware/validation');

router.post('/', validateCampaign, createCampaign);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);
router.get('/:id/stats', getCampaignStats);
router.put('/:id', validateCampaign, updateCampaign);
router.delete('/:id', deleteCampaign);
router.post('/audience-preview', getAudiencePreview);

module.exports = router;