/** Compact catalogue seed data for buildPopularityCatalogue.mjs */
export const CATALOGUE = [
  { id: 'delhi', name: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209, cover: '1587474260584-136574528ed5', pop: 97, match: 92, weather: 'Warm & hazy', aqi: 180, budget: '₹4,500', travel: '2h', summary: 'India Gate evenings, Old Delhi lanes, and Mughal monuments — capital culture in one metro sweep.', moods: ['Explore', 'Active'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['Half Day', 'One Day', 'Multi-day'], styles: ['Family', 'Friends', 'Solo', 'Group'], categories: ['metro', 'urban', 'heritage', 'architecture', 'culture', 'food', 'photo'], tier: 'Premium' },
  { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081, cover: '1748433069400-3d7b4ac6b3e6', pop: 96, match: 94, weather: 'Dry heat', aqi: 120, budget: '₹2,800', travel: '4h', summary: 'Taj Mahal at dawn and Agra Fort ramparts — India\'s most iconic heritage day.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Couple', 'Family', 'Friends'], categories: ['heritage', 'architecture', 'culture', 'photo', 'romantic', 'scenic'], tier: 'Moderate' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, cover: '1650530777057-3a7dbc24bf6c', pop: 96, match: 93, weather: 'Dry heat', aqi: 95, budget: '₹3,800', travel: '8h', summary: 'Pink City forts, Hawa Mahal facades, and bazaar sunsets from Nahargarh.', moods: ['Explore', 'Active'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Family', 'Friends', 'Couple'], categories: ['heritage', 'architecture', 'culture', 'photo', 'food', 'views'], tier: 'Moderate' },
  { id: 'goa', name: 'Goa', state: 'Goa', lat: 15.2993, lon: 74.124, cover: '1507525428034-b723cf961d3e', pop: 98, match: 95, weather: 'Tropical breezy', aqi: 45, budget: '₹5,200', travel: '12h', summary: 'Palolem sands, Portuguese lanes, and sunset shacks — India\'s classic beach escape.', moods: ['Relax', 'Unwind', 'Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['beach', 'coastal', 'culture', 'food', 'photo', 'sunset', 'weekend'], tier: 'Premium' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lon: 72.8777, cover: '1598434192043-71111c1b3f41', pop: 97, match: 91, weather: 'Humid coastal', aqi: 130, budget: '₹5,800', travel: '14h', summary: 'Gateway of India, Marine Drive arcs, and street-food nights — maximum urban energy.', moods: ['Explore', 'Active'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Solo', 'Couple'], categories: ['metro', 'urban', 'coastal', 'food', 'culture', 'photo', 'heritage'], tier: 'Premium' },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, cover: '1561359313-0639aad49ca6', pop: 94, match: 92, weather: 'Warm & misty', aqi: 140, budget: '₹2,200', travel: '6h', summary: 'Ganga aarti at Dashashwamedh Ghat and dawn boat rides — spiritual heart of India.', moods: ['Explore', 'Unwind'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Solo', 'Friends', 'Couple'], categories: ['pilgrimage', 'spiritual', 'culture', 'ghats', 'photo', 'heritage'], tier: 'Budget Friendly' },
  { id: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642, cover: '1493246507139-91e8fad9978e', pop: 88, match: 87, weather: 'Pleasant', aqi: 75, budget: '₹1,800', travel: '5h', summary: 'Har Ki Pauri Ganga aarti and temple lanes at the Himalayan foothills.', moods: ['Relax', 'Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Friends'], categories: ['pilgrimage', 'spiritual', 'ghats', 'culture', 'family'], tier: 'Budget Friendly' },
  { id: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676, cover: '1581793745862-99fde7fa73d2', pop: 91, match: 90, weather: 'Cool river breeze', aqi: 55, budget: '₹2,600', travel: '6h', summary: 'Raft the Ganges, walk Lakshman Jhula, and unwind in yoga-capital cafés.', moods: ['Active', 'Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Solo', 'Couple'], categories: ['pilgrimage', 'spiritual', 'adventure', 'hills', 'ghats', 'trekking'], tier: 'Budget Friendly' },
  { id: 'manali', name: 'Manali', state: 'Himachal Pradesh', lat: 32.2396, lon: 77.1887, cover: '1482192505345-5655af888cc4', pop: 94, match: 92, weather: 'Alpine cool', aqi: 35, budget: '₹4,500', travel: '14h', summary: 'Beas valley cedar forests, Solang adventures, and snow-capped Rohtang views.', moods: ['Active', 'Explore', 'Relax'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['hills', 'mountains', 'adventure', 'nature', 'scenic', 'trekking', 'snow'], tier: 'Moderate' },
  { id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, cover: '1490730141103-6cac27aaab94', pop: 90, match: 87, weather: 'Cool hill air', aqi: 40, budget: '₹3,900', travel: '12h', summary: 'Ridge promenade walks, toy-train nostalgia, and cedar-lined colonial streets.', moods: ['Relax', 'Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Couple', 'Friends'], categories: ['hills', 'mountains', 'heritage', 'family', 'scenic', 'weekend', 'cafe'], tier: 'Moderate' },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125, cover: '1703092289078-ff03b771237c', pop: 95, match: 94, weather: 'Mild evenings', aqi: 70, budget: '₹4,200', travel: '10h', summary: 'Lake Pichola palaces, rooftop dinners, and romantic white-city heritage.', moods: ['Relax', 'Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Couple', 'Family', 'Friends'], categories: ['heritage', 'architecture', 'lake', 'romantic', 'photo', 'culture', 'cafe'], tier: 'Premium' },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243, cover: '1605649487212-47bdab064df7', pop: 87, match: 88, weather: 'Dry & bright', aqi: 78, budget: '₹3,600', travel: '11h', summary: 'Blue City lanes beneath Mehrangarh — fort views and desert-edge bazaars.', moods: ['Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['heritage', 'architecture', 'photo', 'culture', 'food', 'views'], tier: 'Moderate' },
  { id: 'jaisalmer', name: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lon: 70.9083, cover: '1471922694854-ff1b63b20054', pop: 89, match: 90, weather: 'Desert heat', aqi: 68, budget: '₹4,800', travel: '16h', summary: 'Golden fort living lanes and Thar dune camps under starry desert skies.', moods: ['Explore', 'Active'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Couple', 'Group'], categories: ['heritage', 'architecture', 'desert', 'adventure', 'photo', 'culture', 'sunset'], tier: 'Moderate' },
  { id: 'amritsar', name: 'Amritsar', state: 'Punjab', lat: 31.634, lon: 74.8723, cover: '1623059508779-2542c6e83753', pop: 93, match: 91, weather: 'Seasonal extremes', aqi: 110, budget: '₹2,900', travel: '8h', summary: 'Golden Temple langar serenity and Wagah border ceremony energy.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Friends', 'Solo'], categories: ['pilgrimage', 'spiritual', 'heritage', 'culture', 'food', 'family', 'photo'], tier: 'Budget Friendly' },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946, cover: '1697130383976-38f28c444292', pop: 94, match: 88, weather: 'Pleasant', aqi: 85, budget: '₹4,800', travel: '0h', summary: 'Garden-city cafés, brewery trails, and weekend gateways from a lively metro.', moods: ['Explore', 'Relax'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['Half Day', 'One Day', 'Multi-day'], styles: ['Friends', 'Couple', 'Solo'], categories: ['metro', 'urban', 'food', 'cafe', 'culture', 'weekend'], tier: 'Premium' },
  { id: 'mysore', name: 'Mysore', state: 'Karnataka', lat: 12.2958, lon: 76.6394, cover: '1657856855186-7cf4909a4f78', pop: 92, match: 89, weather: 'Pleasant', aqi: 52, budget: '₹2,700', travel: '3h', summary: 'Illuminated palace nights, Chamundi Hill views, and silk-market heritage.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['Half Day', 'One Day', 'Multi-day'], styles: ['Family', 'Friends', 'Couple'], categories: ['heritage', 'architecture', 'culture', 'photo', 'family', 'food'], tier: 'Moderate' },
  { id: 'ooty', name: 'Ooty', state: 'Tamil Nadu', lat: 11.4064, lon: 76.6932, cover: '1587538445896-d1f222cb0653', pop: 98, match: 95, weather: 'Cool & misty', aqi: 42, budget: '₹3,200', travel: '5h 30m', summary: 'Nilgiri lake mornings and botanical gardens — classic South Indian hill escape.', moods: ['Relax', 'Unwind', 'Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day', 'Half Day'], styles: ['Family', 'Friends', 'Solo'], categories: ['hills', 'mountains', 'nature', 'lake', 'views', 'weekend', 'family', 'photo'], tier: 'Moderate' },
  { id: 'munnar', name: 'Munnar', state: 'Kerala', lat: 10.0889, lon: 77.0595, cover: '1633931698758-f59cdaf042a2', pop: 94, match: 93, weather: 'Pleasant', aqi: 38, budget: '₹3,800', travel: '7h', summary: 'Tea-estate valleys and misty viewpoints — calm photography-friendly hills.', moods: ['Relax', 'Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['hills', 'mountains', 'nature', 'photo', 'scenic', 'romantic', 'weekend'], tier: 'Moderate' },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, cover: '1544551763-46a013bb70d5', pop: 90, match: 88, weather: 'Humid coastal', aqi: 50, budget: '₹3,400', travel: '8h', summary: 'Fort Kochi nets, spice markets, and backwater day trips from a food-forward port.', moods: ['Explore', 'Relax'], budgetTier: ['₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Couple', 'Friends', 'Family'], categories: ['food', 'culture', 'coastal', 'heritage', 'photo', 'cafe'], tier: 'Moderate' },
  { id: 'alleppey', name: 'Alleppey', state: 'Kerala', lat: 9.4981, lon: 76.3388, cover: '1593693397690-362cb9666fc2', pop: 93, match: 92, weather: 'Tropical humid', aqi: 40, budget: '₹4,600', travel: '9h', summary: 'Houseboat canals, paddy-fringed lagoons, and slow backwater romance.', moods: ['Relax', 'Unwind'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Couple', 'Family', 'Friends'], categories: ['lake', 'nature', 'romantic', 'scenic', 'backwaters', 'coastal', 'family'], tier: 'Premium' },
  { id: 'darjeeling', name: 'Darjeeling', state: 'West Bengal', lat: 27.041, lon: 88.2663, cover: '1677858741767-1776b8dcde52', pop: 91, match: 90, weather: 'Misty cool', aqi: 30, budget: '₹4,200', travel: '18h', summary: 'Kanchenjunga sunrises, toy train loops, and Himalayan tea-estate walks.', moods: ['Explore', 'Relax'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Couple', 'Friends', 'Family'], categories: ['hills', 'mountains', 'nature', 'scenic', 'photo', 'views', 'culture'], tier: 'Moderate' },
  { id: 'gangtok', name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lon: 88.6065, cover: '1600242466690-c1c04f081762', pop: 88, match: 89, weather: 'Crisp mountain air', aqi: 25, budget: '₹4,800', travel: '20h', summary: 'Monastery viewpoints, MG Marg cafés, and gateway to North Sikkim passes.', moods: ['Explore', 'Relax'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['hills', 'mountains', 'spiritual', 'culture', 'scenic', 'adventure'], tier: 'Moderate' },
  { id: 'nainital', name: 'Nainital', state: 'Uttarakhand', lat: 29.3803, lon: 79.4636, cover: '1548266652-99cf27701ced', pop: 87, match: 86, weather: 'Cool lake breeze', aqi: 48, budget: '₹3,200', travel: '7h', summary: 'Mall Road lake loops, Snow View cable car, and family-friendly hill charm.', moods: ['Relax', 'Unwind'], budgetTier: ['₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Couple', 'Friends'], categories: ['hills', 'lake', 'family', 'weekend', 'scenic', 'romantic'], tier: 'Moderate' },
  { id: 'mussoorie', name: 'Mussoorie', state: 'Uttarakhand', lat: 30.4598, lon: 78.0644, cover: '1500530855697-b586d89ba3ee', pop: 86, match: 86, weather: 'Misty hills', aqi: 45, budget: '₹3,500', travel: '10h', summary: 'Camel\'s Back Road strolls, Kempty Falls day trips, and café hill evenings.', moods: ['Relax', 'Unwind'], budgetTier: ['₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Couple', 'Family', 'Friends'], categories: ['hills', 'mountains', 'scenic', 'romantic', 'cafe', 'weekend'], tier: 'Moderate' },
  { id: 'leh', name: 'Leh-Ladakh', state: 'Ladakh', lat: 34.1526, lon: 77.5771, cover: '1619837374214-f5b9eb80876d', pop: 95, match: 94, weather: 'High-altitude dry', aqi: 20, budget: '₹8,500', travel: 'Flight + road', summary: 'Pangong blues, Nubra dunes, and monastery passes — premium Himalayan adventure.', moods: ['Active', 'Explore'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Couple', 'Solo'], categories: ['mountains', 'adventure', 'nature', 'scenic', 'photo', 'lake', 'desert'], tier: 'Premium' },
  { id: 'shirdi', name: 'Shirdi', state: 'Maharashtra', lat: 19.7645, lon: 74.477, cover: '1707733580929-19bf89c7ede6', pop: 85, match: 84, weather: 'Warm plains', aqi: 70, budget: '₹1,600', travel: '12h', summary: 'Sai Baba darshan queues and peaceful temple-town stays for faith travellers.', moods: ['Relax', 'Unwind'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Group'], categories: ['pilgrimage', 'spiritual', 'culture', 'family'], tier: 'Budget Friendly' },
  { id: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192, cover: '1741003412854-bd4b264c4af3', pop: 92, match: 90, weather: 'Warm hills', aqi: 65, budget: '₹1,900', travel: '5h', summary: 'Tirumala hill temple darshan and Tirupati laddu pilgrimage circuit.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Group'], categories: ['pilgrimage', 'spiritual', 'hills', 'culture', 'family'], tier: 'Budget Friendly' },
  { id: 'vaishno-devi', name: 'Vaishno Devi (Katra)', state: 'Jammu & Kashmir', lat: 33.0308, lon: 74.949, cover: '1691735214703-310c6594c6a8', pop: 90, match: 88, weather: 'Mountain cool', aqi: 35, budget: '₹2,400', travel: '14h', summary: '14-km uphill trek to the holy cave shrine through pine-clad Katra trails.', moods: ['Active', 'Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Friends'], categories: ['pilgrimage', 'spiritual', 'trekking', 'mountains', 'adventure'], tier: 'Budget Friendly' },
  { id: 'bodh-gaya', name: 'Bodh Gaya', state: 'Bihar', lat: 24.6961, lon: 84.9914, cover: '1724303740927-bbb568013fd1', pop: 82, match: 85, weather: 'Warm plains', aqi: 80, budget: '₹1,700', travel: '16h', summary: 'Mahabodhi Temple under the Bodhi tree — Buddhism\'s most sacred pilgrimage.', moods: ['Unwind', 'Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Solo', 'Friends', 'Couple'], categories: ['pilgrimage', 'spiritual', 'heritage', 'architecture', 'culture'], tier: 'Budget Friendly' },
  { id: 'puri', name: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312, cover: '1655394602738-eff266100405', pop: 86, match: 87, weather: 'Coastal warm', aqi: 46, budget: '₹2,300', travel: '18h', summary: 'Jagannath Temple rituals and golden beach sunsets on the Odisha coast.', moods: ['Relax', 'Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Couple', 'Friends'], categories: ['pilgrimage', 'spiritual', 'beach', 'coastal', 'culture', 'heritage'], tier: 'Budget Friendly' },
  { id: 'khajuraho', name: 'Khajuraho', state: 'Madhya Pradesh', lat: 24.8318, lon: 79.9199, cover: '1772457165831-d6df878706ef', pop: 74, match: 86, weather: 'Dry plains', aqi: 60, budget: '₹2,800', travel: '14h', summary: 'UNESCO Chandela temple sculptures — world heritage art in warm sandstone.', moods: ['Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Couple', 'Solo', 'Friends'], categories: ['heritage', 'architecture', 'culture', 'photo'], tier: 'Moderate' },
  { id: 'hampi', name: 'Hampi', state: 'Karnataka', lat: 15.335, lon: 76.46, cover: '1548013146-72479768bada', pop: 91, match: 92, weather: 'Hot & dry', aqi: 58, budget: '₹2,500', travel: '8h', summary: 'Boulder-strewn Vijayanagara ruins, coracle rides, and sunrise Matanga Hill.', moods: ['Explore', 'Active'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Solo', 'Couple'], categories: ['heritage', 'architecture', 'culture', 'photo', 'adventure', 'scenic'], tier: 'Moderate' },
  { id: 'ajanta-ellora', name: 'Ajanta & Ellora (Aurangabad)', state: 'Maharashtra', lat: 20.5519, lon: 75.7033, cover: '1515162816999-a0c47dc192f7', pop: 80, match: 85, weather: 'Warm Deccan', aqi: 55, budget: '₹2,600', travel: '10h', summary: 'Rock-cut Buddhist and Hindu cave complexes — Deccan heritage masterpiece.', moods: ['Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Family', 'Solo'], categories: ['heritage', 'architecture', 'culture', 'photo'], tier: 'Moderate' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, cover: '1558431382-27e303142255', pop: 93, match: 89, weather: 'Humid warm', aqi: 100, budget: '₹4,200', travel: '16h', summary: 'Victoria Memorial lawns, tram rides, and adda-over-chai literary culture.', moods: ['Explore', 'Relax'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['metro', 'urban', 'heritage', 'culture', 'food', 'architecture'], tier: 'Moderate' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, cover: '1618221195710-dd6b41faaea6', pop: 91, match: 87, weather: 'Hot coastal', aqi: 95, budget: '₹4,000', travel: '6h', summary: 'Marina Beach dawn, Kapaleeshwarar gopuram, and filter-coffee metro rhythm.', moods: ['Explore', 'Active'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Friends', 'Solo'], categories: ['metro', 'urban', 'coastal', 'culture', 'food', 'heritage'], tier: 'Moderate' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.385, lon: 78.4867, cover: '1696941515998-d83f24967aca', pop: 92, match: 90, weather: 'Warm dry', aqi: 90, budget: '₹4,100', travel: '6h', summary: 'Charminar lanes, Golconda ramparts, and biryani-forward Nawabi heritage.', moods: ['Explore', 'Active'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Family', 'Couple'], categories: ['metro', 'urban', 'heritage', 'architecture', 'food', 'culture'], tier: 'Moderate' },
  { id: 'pondicherry', name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083, cover: '1516483638261-f4dbaf036963', pop: 90, match: 91, weather: 'Warm & breezy', aqi: 55, budget: '₹2,800', travel: '5h', summary: 'French Quarter pastel lanes, Promenade beach, and café culture by the sea.', moods: ['Explore', 'Relax'], budgetTier: ['₹3000', 'Flexible'], timeFits: ['Half Day', 'One Day', 'Multi-day'], styles: ['Couple', 'Friends', 'Family'], categories: ['beach', 'coastal', 'heritage', 'architecture', 'culture', 'cafe', 'romantic'], tier: 'Moderate' },
  { id: 'kovalam', name: 'Kovalam', state: 'Kerala', lat: 8.4004, lon: 76.9787, cover: '1519046904884-53103b34b206', pop: 80, match: 86, weather: 'Tropical', aqi: 42, budget: '₹3,400', travel: '12h', summary: 'Crescent beaches and lighthouse cliffs — classic Kerala coastal stay.', moods: ['Relax', 'Unwind'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Couple', 'Friends'], categories: ['beach', 'coastal', 'nature', 'sunset', 'family', 'scenic'], tier: 'Moderate' },
  { id: 'andaman', name: 'Andaman Islands', state: 'Andaman', lat: 11.6234, lon: 92.7265, cover: '1586053226626-febc8817962f', pop: 88, match: 93, weather: 'Island tropical', aqi: 28, budget: '₹7,500', travel: 'Flight + ferry', summary: 'Radhanagar white sand, coral reefs, and turquoise premium island escape.', moods: ['Relax', 'Explore', 'Active'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Couple', 'Friends', 'Family'], categories: ['beach', 'coastal', 'nature', 'scenic', 'adventure', 'photo'], tier: 'Premium' },
  { id: 'mount-abu', name: 'Mount Abu', state: 'Rajasthan', lat: 24.5925, lon: 72.7156, cover: '1600356033695-a003690a6351', pop: 84, match: 85, weather: 'Cool hill pocket', aqi: 42, budget: '₹3,000', travel: '12h', summary: 'Rajasthan\'s only hill station — Nakki Lake and Dilwara marble temples.', moods: ['Relax', 'Explore'], budgetTier: ['₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Couple', 'Friends'], categories: ['hills', 'lake', 'heritage', 'spiritual', 'family', 'weekend'], tier: 'Moderate' },
  { id: 'pushkar', name: 'Pushkar', state: 'Rajasthan', lat: 26.4892, lon: 74.5511, cover: '1584245231969-b906af752fd3', pop: 83, match: 86, weather: 'Desert mild', aqi: 60, budget: '₹2,100', travel: '10h', summary: 'Holy lake ghats, Brahma Temple, and camel-fair desert-town colour.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Solo', 'Friends', 'Couple'], categories: ['pilgrimage', 'spiritual', 'culture', 'desert', 'photo', 'heritage'], tier: 'Budget Friendly' },
  { id: 'dwarka', name: 'Dwarka', state: 'Gujarat', lat: 22.2442, lon: 68.9685, cover: '1711547979445-a72c87dfd004', pop: 81, match: 84, weather: 'Coastal dry', aqi: 55, budget: '₹2,200', travel: '20h', summary: 'Dwarkadhish Temple on the Gujarat coast — Krishna pilgrimage by the sea.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Group'], categories: ['pilgrimage', 'spiritual', 'coastal', 'heritage', 'culture'], tier: 'Budget Friendly' },
  { id: 'rameswaram', name: 'Rameswaram', state: 'Tamil Nadu', lat: 9.2876, lon: 79.3129, cover: '1701665836329-57c6a17a2daf', pop: 85, match: 86, weather: 'Island warm', aqi: 40, budget: '₹2,500', travel: '10h', summary: 'Ramanathaswamy Temple corridors and Pamban Bridge sea-island pilgrimage.', moods: ['Explore', 'Relax'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Friends'], categories: ['pilgrimage', 'spiritual', 'coastal', 'heritage', 'culture'], tier: 'Budget Friendly' },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, cover: '1692173248120-59547c3d4653', pop: 87, match: 88, weather: 'Hot plains', aqi: 70, budget: '₹2,000', travel: '6h', summary: 'Meenakshi Temple gopurams and jasmine-market Tamil heritage nights.', moods: ['Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Family', 'Solo', 'Friends'], categories: ['pilgrimage', 'spiritual', 'heritage', 'architecture', 'culture', 'food'], tier: 'Budget Friendly' },
  { id: 'coorg', name: 'Coorg', state: 'Karnataka', lat: 12.3375, lon: 75.8069, cover: '1441974231531-c6227db76b6e', pop: 88, match: 89, weather: 'Light showers', aqi: 40, budget: '₹4,100', travel: '8h', summary: 'Coffee-estate trails, Abbey Falls, and misty Kodagu weekend forests.', moods: ['Active', 'Relax', 'Explore'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Family', 'Couple'], categories: ['hills', 'forest', 'nature', 'adventure', 'food', 'weekend'], tier: 'Moderate' },
  { id: 'wayanad', name: 'Wayanad', state: 'Kerala', lat: 11.6854, lon: 76.132, cover: '1458668383970-8ddd3927deed', pop: 92, match: 92, weather: 'Cloudy', aqi: 33, budget: '₹3,500', travel: '9h', summary: 'Waterfalls, wildlife sanctuaries, and spice-forest drives in the Western Ghats.', moods: ['Explore', 'Active', 'Unwind'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['One Day', 'Multi-day'], styles: ['Friends', 'Group', 'Couple'], categories: ['hills', 'wildlife', 'nature', 'forest', 'adventure', 'scenic', 'drive'], tier: 'Moderate' },
  { id: 'kodaikanal', name: 'Kodaikanal', state: 'Tamil Nadu', lat: 10.2381, lon: 77.4892, cover: '1565315527461-d1d090885aed', pop: 86, match: 91, weather: 'Fresh breeze', aqi: 35, budget: '₹2,900', travel: '6h', summary: 'Pine forests, star-shaped lake, and romantic Kodai hill trails.', moods: ['Unwind', 'Relax', 'Explore'], budgetTier: ['₹1000', '₹3000', 'Flexible'], timeFits: ['Half Day', 'One Day', 'Multi-day'], styles: ['Solo', 'Friends', 'Couple'], categories: ['hills', 'mountains', 'nature', 'lake', 'romantic', 'weekend', 'photo'], tier: 'Moderate' },
  { id: 'mahabaleshwar', name: 'Mahabaleshwar', state: 'Maharashtra', lat: 17.9239, lon: 73.6586, cover: '1475924156734-496f6cac6ec1', pop: 93, match: 91, weather: 'Pleasant', aqi: 48, budget: '₹4,500', travel: '14h', summary: 'Strawberry farms, Venna Lake boating, and misty Sahyadri viewpoints.', moods: ['Relax', 'Explore'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Family', 'Friends', 'Couple'], categories: ['hills', 'lake', 'nature', 'family', 'romantic', 'food', 'scenic'], tier: 'Premium' },
  { id: 'rann-of-kutch', name: 'Rann of Kutch', state: 'Gujarat', lat: 23.7337, lon: 70.9972, cover: '1670406312373-6d4d1776e4aa', pop: 84, match: 88, weather: 'Dry & windy', aqi: 45, budget: '₹3,800', travel: '18h', summary: 'White salt desert under full moon and Rann Utsav tent-city culture.', moods: ['Explore', 'Active'], budgetTier: ['₹3000', '₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Couple', 'Family'], categories: ['desert', 'wildlife', 'nature', 'photo', 'scenic', 'adventure', 'festival'], tier: 'Moderate' },
  { id: 'ranthambore', name: 'Ranthambore', state: 'Rajasthan', lat: 26.0173, lon: 76.5026, cover: '1615551298862-0795063e3f1e', pop: 86, match: 89, weather: 'Dry warm', aqi: 55, budget: '₹5,500', travel: '10h', summary: 'Tiger safaris amid Ranthambore Fort ruins — Rajasthan\'s top wildlife circuit.', moods: ['Active', 'Explore'], budgetTier: ['₹5000+', 'Flexible'], timeFits: ['Multi-day'], styles: ['Friends', 'Family', 'Couple'], categories: ['wildlife', 'nature', 'adventure', 'heritage', 'photo', 'forest'], tier: 'Premium' },
];

export const ATTRACTIONS = {
  delhi: [
    ['India Gate', 'Heritage'], ['Red Fort', 'Heritage'], ['Qutub Minar', 'Heritage'],
    ['Humayun\'s Tomb', 'Heritage'], ['Lotus Temple', 'Architecture'], ['Chandni Chowk', 'Culture'],
  ],
  agra: [
    ['Taj Mahal', 'Heritage'], ['Agra Fort', 'Heritage'], ['Mehtab Bagh', 'Garden'],
    ['Itimad-ud-Daulah', 'Heritage'], ['Akbar\'s Tomb', 'Heritage'], ['Yamuna Viewpoint', 'Viewpoint'],
  ],
  jaipur: [
    ['Amer Fort', 'Heritage'], ['Hawa Mahal', 'Heritage'], ['City Palace', 'Heritage'],
    ['Nahargarh Fort', 'Viewpoint'], ['Jantar Mantar', 'Heritage'], ['Johari Bazaar', 'Culture'],
  ],
  goa: [
    ['Palolem Beach', 'Beach'], ['Basilica of Bom Jesus', 'Heritage'], ['Fort Aguada', 'Heritage'],
    ['Dudhsagar Falls', 'Waterfall'], ['Anjuna Flea Market', 'Culture'], ['Chapora Fort', 'Viewpoint'],
  ],
  mumbai: [
    ['Gateway of India', 'Heritage'], ['Marine Drive', 'Scenic'], ['Elephanta Caves', 'Heritage'],
    ['Crawford Market', 'Culture'], ['Haji Ali Dargah', 'Heritage'], ['Bandra-Worli Sea Link', 'Viewpoint'],
  ],
  varanasi: [
    ['Dashashwamedh Ghat', 'Heritage'], ['Kashi Vishwanath', 'Temple'], ['Assi Ghat', 'Heritage'],
    ['Boat Ride at Dawn', 'Scenic'], ['Sarnath', 'Heritage'], ['Manikarnika Ghat', 'Culture'],
  ],
  haridwar: [
    ['Har Ki Pauri', 'Heritage'], ['Ganga Aarti', 'Culture'], ['Mansa Devi Temple', 'Temple'],
    ['Chandi Devi', 'Temple'], ['Rajaji National Park', 'Nature'], ['Bharat Mata Mandir', 'Heritage'],
  ],
  rishikesh: [
    ['Lakshman Jhula', 'Heritage'], ['Ram Jhula', 'Heritage'], ['Triveni Ghat', 'Heritage'],
    ['River Rafting', 'Adventure'], ['Neelkanth Mahadev', 'Temple'], ['Beatles Ashram', 'Culture'],
  ],
  manali: [
    ['Solang Valley', 'Adventure'], ['Hadimba Temple', 'Heritage'], ['Rohtang Pass', 'Viewpoint'],
    ['Old Manali Cafés', 'Cafe'], ['Vashisht Hot Springs', 'Nature'], ['Beas River Walk', 'Scenic'],
  ],
  shimla: [
    ['The Ridge', 'Viewpoint'], ['Mall Road', 'Culture'], ['Jakhoo Temple', 'Temple'],
    ['Kufri', 'Adventure'], ['Christ Church', 'Heritage'], ['Toy Train Station', 'Heritage'],
  ],
  udaipur: [
    ['City Palace', 'Heritage'], ['Lake Pichola', 'Lake'], ['Jag Mandir', 'Heritage'],
    ['Saheliyon Ki Bari', 'Garden'], ['Sajjangarh Monsoon Palace', 'Viewpoint'], ['Bagore Ki Haveli', 'Culture'],
  ],
  jodhpur: [
    ['Mehrangarh Fort', 'Heritage'], ['Blue City Walk', 'Culture'], ['Jaswant Thada', 'Heritage'],
    ['Umaid Bhawan', 'Heritage'], ['Clock Tower Market', 'Culture'], ['Mandore Gardens', 'Garden'],
  ],
  jaisalmer: [
    ['Jaisalmer Fort', 'Heritage'], ['Sam Sand Dunes', 'Desert'], ['Patwon Ki Haveli', 'Heritage'],
    ['Gadisar Lake', 'Lake'], ['Desert Safari Camp', 'Adventure'], ['Salim Singh Haveli', 'Heritage'],
  ],
  amritsar: [
    ['Golden Temple', 'Temple'], ['Wagah Border', 'Culture'], ['Jallianwala Bagh', 'Heritage'],
    ['Partition Museum', 'Culture'], ['Gobindgarh Fort', 'Heritage'], ['Hall Bazaar', 'Culture'],
  ],
  bangalore: [
    ['Lalbagh Botanical Garden', 'Garden'], ['Cubbon Park', 'Park'], ['Bangalore Palace', 'Heritage'],
    ['Nandi Hills Day Trip', 'Viewpoint'], ['MG Road', 'Culture'], ['KR Market', 'Culture'],
  ],
  mysore: [
    ['Mysore Palace', 'Heritage'], ['Chamundi Hills', 'Viewpoint'], ['Brindavan Gardens', 'Garden'],
    ['St. Philomena Church', 'Heritage'], ['Devaraja Market', 'Culture'], ['Karanji Lake', 'Lake'],
  ],
  ooty: [
    ['Ooty Lake', 'Lake'], ['Botanical Garden', 'Garden'], ['Doddabetta Peak', 'Viewpoint'],
    ['Rose Garden', 'Garden'], ['Nilgiri Mountain Railway', 'Heritage'], ['Tea Museum', 'Culture'],
  ],
  munnar: [
    ['Tea Museum', 'Culture'], ['Eravikulam National Park', 'Nature'], ['Mattupetty Dam', 'Lake'],
    ['Echo Point', 'Viewpoint'], ['Top Station', 'Viewpoint'], ['Attukad Waterfalls', 'Waterfall'],
  ],
  kochi: [
    ['Fort Kochi Beach', 'Beach'], ['Chinese Fishing Nets', 'Heritage'], ['Mattancherry Palace', 'Heritage'],
    ['Jew Town', 'Culture'], ['Marine Drive', 'Scenic'], ['Spice Market', 'Culture'],
  ],
  alleppey: [
    ['Houseboat Cruise', 'Scenic'], ['Vembanad Lake', 'Lake'], ['Alleppey Beach', 'Beach'],
    ['Paddy Field Walk', 'Nature'], ['Pathiramanal Island', 'Nature'], ['Snake Boat Race Point', 'Culture'],
  ],
  darjeeling: [
    ['Tiger Hill Sunrise', 'Viewpoint'], ['Batasia Loop', 'Heritage'], ['Peace Pagoda', 'Temple'],
    ['Happy Valley Tea Estate', 'Culture'], ['Darjeeling Zoo', 'Wildlife'], ['Mall Road', 'Culture'],
  ],
  gangtok: [
    ['Rumtek Monastery', 'Temple'], ['MG Marg', 'Culture'], ['Tsomgo Lake', 'Lake'],
    ['Enchey Monastery', 'Temple'], ['Ganesh Tok Viewpoint', 'Viewpoint'], ['Baba Harbhajan Mandir', 'Heritage'],
  ],
  nainital: [
    ['Naini Lake', 'Lake'], ['Snow View Point', 'Viewpoint'], ['Mall Road', 'Culture'],
    ['Naina Devi Temple', 'Temple'], ['Eco Cave Gardens', 'Nature'], ['Tiffin Top', 'Viewpoint'],
  ],
  mussoorie: [
    ['Camel\'s Back Road', 'Scenic'], ['Kempty Falls', 'Waterfall'], ['Gun Hill', 'Viewpoint'],
    ['Lal Tibba', 'Viewpoint'], ['Company Garden', 'Garden'], ['Library Bazaar', 'Culture'],
  ],
  leh: [
    ['Pangong Lake', 'Lake'], ['Nubra Valley', 'Desert'], ['Khardung La', 'Viewpoint'],
    ['Shanti Stupa', 'Temple'], ['Magnetic Hill', 'Nature'], ['Leh Palace', 'Heritage'],
  ],
  shirdi: [
    ['Sai Baba Samadhi', 'Temple'], ['Dwarkamai', 'Heritage'], ['Chavadi', 'Heritage'],
    ['Shani Shingnapur', 'Temple'], ['Lendi Garden', 'Garden'], ['Prasadalaya', 'Culture'],
  ],
  tirupati: [
    ['Tirumala Temple', 'Temple'], ['Silathoranam', 'Nature'], ['Akasa Ganga', 'Waterfall'],
    ['Sri Venkateswara Museum', 'Culture'], ['Kapila Theertham', 'Heritage'], ['Alipiri Footpath', 'Trekking'],
  ],
  'vaishno-devi': [
    ['Vaishno Devi Cave', 'Temple'], ['Ardhkuwari', 'Heritage'], ['Bhairavnath Temple', 'Temple'],
    ['Banganga', 'Heritage'], ['Sanjichhat', 'Viewpoint'], ['Katra Market', 'Culture'],
  ],
  'bodh-gaya': [
    ['Mahabodhi Temple', 'Temple'], ['Bodhi Tree', 'Heritage'], ['Great Buddha Statue', 'Heritage'],
    ['Thai Monastery', 'Temple'], ['Archaeological Museum', 'Culture'], ['Muchalinda Lake', 'Lake'],
  ],
  puri: [
    ['Jagannath Temple', 'Temple'], ['Puri Beach', 'Beach'], ['Konark Sun Temple', 'Heritage'],
    ['Chilika Lake', 'Lake'], ['Raghurajpur Art Village', 'Culture'], ['Swargadwar Beach', 'Beach'],
  ],
  khajuraho: [
    ['Western Group Temples', 'Heritage'], ['Lakshmana Temple', 'Heritage'], ['Kandariya Mahadev', 'Heritage'],
    ['Archaeological Museum', 'Culture'], ['Raneh Falls', 'Waterfall'], ['Panna Tiger Reserve', 'Wildlife'],
  ],
  hampi: [
    ['Virupaksha Temple', 'Heritage'], ['Vittala Temple', 'Heritage'], ['Matanga Hill', 'Viewpoint'],
    ['Tungabhadra Coracle', 'Adventure'], ['Lotus Mahal', 'Heritage'], ['Hemakuta Hill', 'Viewpoint'],
  ],
  'ajanta-ellora': [
    ['Ajanta Caves', 'Heritage'], ['Ellora Kailasa Temple', 'Heritage'], ['Grishneshwar Jyotirlinga', 'Temple'],
    ['Daulatabad Fort', 'Heritage'], ['Bibi Ka Maqbara', 'Heritage'], ['Khuldabad', 'Heritage'],
  ],
  kolkata: [
    ['Victoria Memorial', 'Heritage'], ['Howrah Bridge', 'Heritage'], ['Dakshineswar Kali Temple', 'Temple'],
    ['Indian Museum', 'Culture'], ['Park Street', 'Culture'], ['Kumortuli', 'Culture'],
  ],
  chennai: [
    ['Marina Beach', 'Beach'], ['Kapaleeshwarar Temple', 'Temple'], ['Fort St. George', 'Heritage'],
    ['Government Museum', 'Culture'], ['San Thome Basilica', 'Heritage'], ['Mylapore Tank', 'Heritage'],
  ],
  hyderabad: [
    ['Charminar', 'Heritage'], ['Golconda Fort', 'Heritage'], ['Hussain Sagar', 'Lake'],
    ['Salar Jung Museum', 'Culture'], ['Ramoji Film City', 'Culture'], ['Laad Bazaar', 'Culture'],
  ],
  pondicherry: [
    ['Promenade Beach', 'Beach'], ['French Quarter', 'Heritage'], ['Sri Aurobindo Ashram', 'Culture'],
    ['Auroville', 'Culture'], ['Paradise Beach', 'Beach'], ['Botanical Garden', 'Garden'],
  ],
  kovalam: [
    ['Lighthouse Beach', 'Beach'], ['Hawah Beach', 'Beach'], ['Samudra Beach', 'Beach'],
    ['Vizhinjam Lighthouse', 'Viewpoint'], ['Ayurveda Centres', 'Culture'], ['Vellayani Lake', 'Lake'],
  ],
  andaman: [
    ['Radhanagar Beach', 'Beach'], ['Cellular Jail', 'Heritage'], ['Havelock Island', 'Beach'],
    ['Ross Island', 'Heritage'], ['Scuba Dive Sites', 'Adventure'], ['Mangrove Creeks', 'Nature'],
  ],
  'mount-abu': [
    ['Nakki Lake', 'Lake'], ['Dilwara Temples', 'Temple'], ['Sunset Point', 'Viewpoint'],
    ['Guru Shikhar', 'Viewpoint'], ['Achalgarh Fort', 'Heritage'], ['Trevor\'s Tank', 'Wildlife'],
  ],
  pushkar: [
    ['Pushkar Lake', 'Lake'], ['Brahma Temple', 'Temple'], ['Savitri Temple', 'Temple'],
    ['Pushkar Bazaar', 'Culture'], ['Man Mahal', 'Heritage'], ['Rose Garden', 'Garden'],
  ],
  dwarka: [
    ['Dwarkadhish Temple', 'Temple'], ['Nageshwar Jyotirlinga', 'Temple'], ['Beyt Dwarka', 'Beach'],
    ['Rukmini Temple', 'Temple'], ['Gomti Ghat', 'Heritage'], ['Sudama Setu Bridge', 'Scenic'],
  ],
  rameswaram: [
    ['Ramanathaswamy Temple', 'Temple'], ['Pamban Bridge', 'Scenic'], ['Dhanushkodi', 'Heritage'],
    ['Agni Theertham', 'Heritage'], ['Gandhamadhana Parvatham', 'Viewpoint'], ['Ariyaman Beach', 'Beach'],
  ],
  madurai: [
    ['Meenakshi Temple', 'Temple'], ['Thirumalai Nayakkar Palace', 'Heritage'], ['Gandhi Museum', 'Culture'],
    ['Alagar Kovil', 'Temple'], ['Vaigai River Promenade', 'Scenic'], ['Pudhu Mandapam', 'Culture'],
  ],
  coorg: [
    ['Abbey Falls', 'Waterfall'], ['Raja\'s Seat', 'Viewpoint'], ['Talakaveri', 'Heritage'],
    ['Dubare Elephant Camp', 'Wildlife'], ['Coffee Estate Tour', 'Culture'], ['Nagarhole Day Trip', 'Wildlife'],
  ],
  wayanad: [
    ['Edakkal Caves', 'Heritage'], ['Soochipara Falls', 'Waterfall'], ['Banasura Sagar Dam', 'Dam'],
    ['Muthanga Wildlife Sanctuary', 'Wildlife'], ['Chembra Peak', 'Trekking'], ['Pookode Lake', 'Lake'],
  ],
  kodaikanal: [
    ['Kodaikanal Lake', 'Lake'], ['Coaker\'s Walk', 'Scenic'], ['Pillar Rocks', 'Viewpoint'],
    ['Bryant Park', 'Garden'], ['Guna Caves', 'Nature'], ['Silver Cascade Falls', 'Waterfall'],
  ],
  mahabaleshwar: [
    ['Venna Lake', 'Lake'], ['Arthur\'s Seat', 'Viewpoint'], ['Elephant\'s Head Point', 'Viewpoint'],
    ['Mapro Garden', 'Garden'], ['Pratapgad Fort', 'Heritage'], ['Strawberry Farms', 'Culture'],
  ],
  'rann-of-kutch': [
    ['White Rann Sunset', 'Desert'], ['Rann Utsav Tent City', 'Culture'], ['Kalo Dungar', 'Viewpoint'],
    ['Kutch Museum', 'Culture'], ['Mandvi Beach', 'Beach'], ['Handicraft Villages', 'Culture'],
  ],
  ranthambore: [
    ['Tiger Safari Zone', 'Wildlife'], ['Ranthambore Fort', 'Heritage'], ['Padam Talao', 'Lake'],
    ['Trinetra Ganesh Temple', 'Temple'], ['Surwal Lake', 'Wildlife'], ['Kachida Valley', 'Nature'],
  ],
};

/** Verified Unsplash photo IDs — pool for attraction images (covers assigned per destination). */
export const IMAGE_POOL = [
  '1748433069400-3d7b4ac6b3e6', '1762005662319-805607c02dfa', '1772457165831-d6df878706ef',
  '1451187580459-43490279c0fa', '1606041008023-472dfb5e530f', '1618221195710-dd6b41faaea6',
  '1511367461989-f85a21fda167', '1587538445896-d1f222cb0653', '1633931698758-f59cdaf042a2',
  '1565315527461-d1d090885aed', '1441974231531-c6227db76b6e', '1458668383970-8ddd3927deed',
  '1475924156734-496f6cac6ec1', '1516483638261-f4dbaf036963', '1519046904884-53103b34b206',
  '1504280390367-361c6d9f38f4', '1548013146-72479768bada', '1564501049412-61c2a3083791',
  '1566073771259-6a8506099945', '1703092289078-ff03b771237c', '1471922694854-ff1b63b20054',
  '1605649487212-47bdab064df7', '1596422846543-75c6fc197f07', '1578662996442-48f60103fc96',
  '1482192505345-5655af888cc4', '1490730141103-6cac27aaab94', '1500530855697-b586d89ba3ee',
  '1677858741767-1776b8dcde52', '1600242466690-c1c04f081762', '1600356033695-a003690a6351',
  '1472214103451-9374bd1c798e', '1476514525535-07fb3b4ae5f1', '1493246507139-91e8fad9978e',
  '1619837374214-f5b9eb80876d', '1559827260-dc66d52bef19', '1544551763-46a013bb70d5',
  '1558431382-27e303142255', '1519681393784-d120267933ba', '1548266652-99cf27701ced',
  '1507525428034-b723cf961d3e', '1655394602738-eff266100405', '1473496169904-658ba7c44d8a',
  '1493558103817-58b2924bce98', '1677211352662-30e7775c7ce8', '1464822759023-fed622ff2c3b',
  '1501785888041-af3ef285b470', '1581793745862-99fde7fa73d2', '1691735214703-310c6594c6a8',
  '1558187424-f786111643b0', '1447752875215-b2761acb3c5d', '1469474968028-56623f02e42e',
  '1506905925346-21bda4d32df4', '1500534314209-a25ddb2bd429', '1439066615861-d1af74d74000',
  '1528183429752-a97d0bf99b5a', '1470071459604-3b5ec3a7fe05', '1469854523086-cc02fe5d8800',
  '1511497584788-876760111969', '1524492412937-b28074a5d7da', '1506461883276-594a12b11cf3',
  '1586864387967-d02ef85d93e8', '1416879595882-3373a0480b5b', '1515162816999-a0c47dc192f7',
  '1519904981063-b0cf448d479e', '1470770841072-f978cf4d019e', '1517427294546-5aa121f68e8a',
  '1544551763-77ef2d0cfc6c', '1483728642387-6c3bdd6c93e5', '1502082553048-f009c37129b9',
  '1516426122078-c23e76319801', '1506744038136-46273834b3fb', '1433086966358-54859d0ed716',
  '1518780664697-55e3ad937233', '1565008447742-97f6f38c985c', '1505142468610-359e7d316be0',
  '1501854140801-50d01698950b', '1551632811-561732d1e306',
];
