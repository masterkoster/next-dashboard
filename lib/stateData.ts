/**
 * US State Static Data
 * Contains bio, terrain info, attractions, and general info for each state
 */

export interface StateInfo {
  state: string;
  stateName: string;
  nickname: string;
  capital: string;
  region: string;
  bio: string;
  terrain: string;
  majorAirports: string[];
  attractions: string[];
  funFact: string;
  avgElevation: number;
  climate: string;
}

export const stateData: Record<string, StateInfo> = {
  AL: {
    state: 'AL', stateName: 'Alabama', nickname: 'Yellowhammer State', capital: 'Montgomery',
    region: 'South', bio: 'Known for southern hospitality, rich music history, and space exploration at Huntsville.',
    terrain: 'Gulf Coast plains, Appalachian foothills, Black Belt prairie',
    majorAirports: ['KBHM', 'KHSV', 'KMOB'],
    attractions: ['NASA Marshall Space Center', 'Gulf Coast Beaches', 'Birmingham Civil Rights District'],
    funFact: 'Home to the first rocket to put humans on the moon!',
    avgElevation: 500, climate: 'Humid subtropical'
  },
  AK: {
    state: 'AK', stateName: 'Alaska', nickname: 'The Last Frontier', capital: 'Juneau',
    region: 'West', bio: 'The largest US state with breathtaking wilderness, glaciers, and northern lights.',
    terrain: 'Mountains, tundra, coastal fjords, boreal forest',
    majorAirports: ['PAFA', 'PANC', 'PADK'],
    attractions: ['Denali National Park', 'Northern Lights', 'Mendenhall Glacier'],
    funFact: 'Alaska has more pilots per capita than any other state!',
    avgElevation: 1900, climate: 'Subarctic to tundra'
  },
  AZ: {
    state: 'AZ', stateName: 'Arizona', nickname: 'Grand Canyon State', capital: 'Phoenix',
    region: 'West', bio: 'Famous for the Grand Canyon, desert landscapes, and year-round sunshine.',
    terrain: 'Desert, canyons, pine forests, volcanic fields',
    majorAirports: ['KPHX', 'KTUS', 'KFLAG'],
    attractions: ['Grand Canyon', 'Sedona Red Rocks', 'Monument Valley'],
    funFact: 'The Grand Canyon is 277 miles long and over a mile deep.',
    avgElevation: 4100, climate: 'Desert to alpine'
  },
  AR: {
    state: 'AR', stateName: 'Arkansas', nickname: 'The Natural State', capital: 'Little Rock',
    region: 'South', bio: 'Known for crystal clear rivers, hot springs, and Ozark Mountain scenery.',
    terrain: 'Ozark Mountains, Arkansas River Valley, Delta plains',
    majorAirports: ['KLIT', 'KXNA', 'KRUE'],
    attractions: ['Hot Springs National Park', 'Ozark Mountains', 'Buffalo National River'],
    funFact: 'Home to the only active diamond mine in the US!',
    avgElevation: 650, climate: 'Humid subtropical'
  },
  CA: {
    state: 'CA', stateName: 'California', nickname: 'The Golden State', capital: 'Sacramento',
    region: 'West', bio: 'The most populous state with diverse landscapes from beaches to mountains.',
    terrain: 'Coastal ranges, Central Valley, Sierra Nevada, deserts',
    majorAirports: ['KLAX', 'KSFO', 'KSAN', 'KSJC'],
    attractions: ['Yosemite National Park', 'Hollywood', 'Wine Country'],
    funFact: 'Produces more food than any other US state!',
    avgElevation: 2900, climate: 'Mediterranean to alpine'
  },
  CO: {
    state: 'CO', stateName: 'Colorado', nickname: 'Centennial State', capital: 'Denver',
    region: 'West', bio: 'Rocky Mountain paradise with world-class skiing and outdoor adventures.',
    terrain: 'Rocky Mountains, high plains, desert canyons',
    majorAirports: ['KDEN', 'KEGE', 'KASE', 'KCOS'],
    attractions: ['Rocky Mountain National Park', 'Vail Ski Resort', 'Pikes Peak'],
    funFact: 'Every aircraft type is required to file a flight plan within Colorado mountains!',
    avgElevation: 6800, climate: 'Semi-arid to alpine'
  },
  CT: {
    state: 'CT', stateName: 'Connecticut', nickname: 'Constitution State', capital: 'Hartford',
    region: 'Northeast', bio: 'Historic New England state with colonial charm and fall foliage.',
    terrain: 'Greenwood hills, coastal plain, Connecticut River Valley',
    majorAirports: ['KBDL', 'KDCA', 'KHVN'],
    attractions: ['Yale University', 'Mystic Seaport', 'Gillette Castle'],
    funFact: 'Home to the first helicopter patent and nuclear submarine!',
    avgElevation: 500, climate: 'Humid continental'
  },
  DE: {
    state: 'DE', stateName: 'Delaware', nickname: 'First State', capital: 'Dover',
    region: 'Northeast', bio: 'The first state to ratify the US Constitution with beautiful beaches.',
    terrain: 'Atlantic coastal plain, Piedmont hills, marshlands',
    majorAirports: ['KILG', 'KGED'],
    attractions: [' Rehoboth Beach', 'Winterthur Museum', 'Dover International Speedway'],
    funFact: 'No sales tax and no state corporate income tax!',
    avgElevation: 60, climate: 'Humid subtropical'
  },
  FL: {
    state: 'FL', stateName: 'Florida', nickname: 'Sunshine State', capital: 'Tallahassee',
    region: 'South', bio: 'The Sunshine State with world-famous theme parks and beautiful beaches.',
    terrain: 'Everglades, coastal dunes, marshlands, karst topography',
    majorAirports: ['KMIA', 'KORL', 'KTPA', 'KFLL'],
    attractions: ['Disney World', 'Key West', 'Everglades National Park'],
    funFact: 'More theme parks than anywhere else on Earth!',
    avgElevation: 100, climate: 'Humid subtropical to tropical'
  },
  GA: {
    state: 'GA', stateName: 'Georgia', nickname: 'Peach State', capital: 'Atlanta',
    region: 'South', bio: 'The Peach State blends southern charm with modern cities and mountains.',
    terrain: 'Piedmont, Blue Ridge Mountains, coastal plain, swamps',
    majorAirports: ['KATL', 'KSAV', 'KABY'],
    attractions: ['Atlanta History Center', 'Savannah Historic District', 'Stone Mountain'],
    funFact: 'Atlanta\'s airport is the busiest in the world by passenger traffic!',
    avgElevation: 700, climate: 'Humid subtropical'
  },
  HI: {
    state: 'HI', stateName: 'Hawaii', nickname: 'Aloha State', capital: 'Honolulu',
    region: 'West', bio: 'Tropical paradise with volcanic landscapes and unique Polynesian culture.',
    terrain: 'Volcanic islands, coral reefs, tropical rainforests',
    majorAirports: ['PHNL', 'PHOG', 'PHKO'],
    attractions: ['Pearl Harbor', 'Haleakala', 'Na Pali Coast'],
    funFact: 'The only US state that grows coffee commercially!',
    avgElevation: 3030, climate: 'Tropical'
  },
  ID: {
    state: 'ID', stateName: 'Idaho', nickname: 'Gem State', capital: 'Boise',
    region: 'West', bio: 'The Gem State offers pristine wilderness, whitewater rivers, and ski resorts.',
    terrain: 'Rocky Mountains, Snake River Plain, high deserts',
    majorAirports: ['KBOI', 'KIDA', 'KSUN'],
    attractions: ['Sun Valley', 'Shoshone Falls', 'Lake Coeur d\'Alene'],
    funFact: 'Contains the deepest river gorge in North America - Hells Canyon!',
    avgElevation: 5000, climate: 'Semi-arid to alpine'
  },
  IL: {
    state: 'IL', stateName: 'Illinois', nickname: 'Prairie State', capital: 'Springfield',
    region: 'Midwest', bio: 'The Prairie State with Chicago as a global hub of industry and culture.',
    terrain: 'Great Plains, Mississippi River bluffs, Chicago lakefront',
    majorAirports: ['KORD', 'KMDW', 'KSPI'],
    attractions: ['Chicago Skyline', 'Abraham Lincoln Museum', 'Route 66'],
    funFact: 'Chicago O\'Hare is one of the busiest airports in the world!',
    avgElevation: 600, climate: 'Humid continental'
  },
  IN: {
    state: 'IN', stateName: 'Indiana', nickname: 'Hoosier State', capital: 'Indianapolis',
    region: 'Midwest', bio: 'The Hoosier State known for racing, Amish country, and universities.',
    terrain: 'Great Lakes plain, hills of southern Indiana, farmland',
    majorAirports: ['KIND', 'KSBN', 'KEWR'],
    attractions: ['Indianapolis Motor Speedway', 'Notre Dame', 'Indiana Dunes'],
    funFact: 'The Indy 500 is the world\'s largest single-day sporting event!',
    avgElevation: 700, climate: 'Humid continental'
  },
  IA: {
    state: 'IA', stateName: 'Iowa', nickname: 'Hawkeye State', capital: 'Des Moines',
    region: 'Midwest', bio: 'The Hawkeye State is known for corn production and friendly communities.',
    terrain: 'Rolling hills, Mississippi River bluffs, prairie',
    majorAirports: ['KDSM', 'KCID', 'KALO'],
    attractions: ['Living History Farm', 'Mason City', 'Amana Colonies'],
    funFact: 'Produces more corn than any other state - enough to feed the world!',
    avgElevation: 1100, climate: 'Humid continental'
  },
  KS: {
    state: 'KS', stateName: 'Kansas', nickname: 'Sunflower State', capital: 'Topeka',
    region: 'Midwest', bio: 'The Sunflower State features endless prairies and \"Wizard of Oz\" history.',
    terrain: 'Great Plains, Flint Hills, Smoky Hills',
    majorAirports: ['KMCI', 'KICT', 'KTOP'],
    attractions: ['Dorothy\'s Grave', 'Tallgrass Prairie', 'Eisenhower Museum'],
    funFact: 'Wizard of Oz was based on a Kansas cyclone!',
    avgElevation: 2000, climate: 'Semi-arid continental'
  },
  KY: {
    state: 'KY', stateName: 'Kentucky', nickname: 'Bluegrass State', capital: 'Frankfort',
    region: 'South', bio: 'Home to horses, bourbon, and the longest cave system in the world.',
    terrain: 'Appalachian Mountains, Bluegrass region, Pennyroyal plateau',
    majorAirports: ['KSDF', 'KLEX', 'KCVG'],
    attractions: ['Kentucky Derby', 'Mammoth Cave', 'Bourbon Trail'],
    funFact: 'More than 450 miles of caves in Mammoth Cave National Park!',
    avgElevation: 750, climate: 'Humid subtropical'
  },
  LA: {
    state: 'LA', stateName: 'Louisiana', nickname: 'Pelican State', capital: 'Baton Rouge',
    region: 'South', bio: 'The Pelican State blends French, Cajun, and Southern cultures.',
    terrain: 'Mississippi Delta, Atchafalaya Basin, Gulf Coast marshes',
    majorAirports: ['KMSY', 'KLFT', 'KBTR'],
    attractions: ['New Orleans French Quarter', 'Bayou tours', 'Cajun Country'],
    funFact: 'The only US state with a large portion of land below sea level!',
    avgElevation: 100, climate: 'Humid subtropical'
  },
  ME: {
    state: 'ME', stateName: 'Maine', nickname: 'Pine Tree State', capital: 'Augusta',
    region: 'Northeast', bio: 'The most forested state with rocky coastline and lobster tradition.',
    terrain: 'Coastal mountains, interior forest, 3000+ miles of coastline',
    majorAirports: ['KPWM', 'KBGR', 'KLEB'],
    attractions: ['Acadia National Park', 'Bar Harbor', 'Lobster fishing'],
    funFact: 'Has the most lighthouses of any US state - over 60!',
    avgElevation: 600, climate: 'Humid continental'
  },
  MD: {
    state: 'MD', stateName: 'Maryland', nickname: 'Old Line State', capital: 'Annapolis',
    region: 'Northeast', bio: 'The Old Line State offers Chesapeake Bay, mountains, and colonial history.',
    terrain: 'Chesapeake Bay, Blue Ridge Mountains, Eastern Shore',
    majorAirports: ['KBWI', 'KDCA', 'KMTN'],
    attractions: ['Annapolis Naval Academy', 'Assateague Island', 'Baltimore Harbor'],
    funFact: 'Home to the US Naval Academy and the first dental school!',
    avgElevation: 350, climate: 'Humid subtropical'
  },
  MA: {
    state: 'MA', stateName: 'Massachusetts', nickname: 'Bay State', capital: 'Boston',
    region: 'Northeast', bio: 'The Bay State pioneered American history and higher education.',
    terrain: 'Coastal plain, Berkshire Hills, Boston Harbor islands',
    majorAirports: ['KBOS', 'KACK', 'KHYA'],
    attractions: ['Harvard University', 'Plymouth Rock', 'Cape Cod'],
    funFact: 'First public school in America was founded in Boston in 1635!',
    avgElevation: 500, climate: 'Humid continental'
  },
  MI: {
    state: 'MI', stateName: 'Michigan', nickname: 'Wolverine State', capital: 'Lansing',
    region: 'Midwest', bio: 'The Great Lakes State with more coastline than any state except Alaska.',
    terrain: 'Great Lakes shorelines, Upper Peninsula wilderness, fertile farmland',
    majorAirports: ['KDTW', 'KGRR', 'KESC'],
    attractions: ['Mackinac Island', 'Great Lakes', 'Motown Museum'],
    funFact: 'Has more public beach access than any other state!',
    avgElevation: 900, climate: 'Humid continental'
  },
  MN: {
    state: 'MN', stateName: 'Minnesota', nickname: 'North Star State', capital: 'St. Paul',
    region: 'Midwest', bio: 'The Land of 10,000 Lakes offers outdoor recreation and cultural attractions.',
    terrain: 'Prairies, boreal forest, 10,000+ lakes',
    majorAirports: ['KMSP', 'KDLH', 'KRST'],
    attractions: ['Voyageurs National Park', 'Mall of America', 'Boundary Waters'],
    funFact: 'Has more lakes than the rest of the US combined!',
    avgElevation: 1200, climate: 'Humid continental'
  },
  MS: {
    state: 'MS', stateName: 'Mississippi', nickname: 'Magnolia State', capital: 'Jackson',
    region: 'South', bio: 'The Magnolia State is rich in music history and southern culture.',
    terrain: 'Delta plains, hills, Gulf Coast',
    majorAirports: ['KJAN', 'KGPT', 'KHKS'],
    attractions: ['Blues Trail', 'Natchez Trace', 'Gulf Coast beaches'],
    funFact: 'The birthplace of America\'s music - blues and rock n roll!',
    avgElevation: 300, climate: 'Humid subtropical'
  },
  MO: {
    state: 'MO', stateName: 'Missouri', nickname: 'Show-Me State', capital: 'Jefferson City',
    region: 'Midwest', bio: 'The Show-Me State offers caves, rivers, and Gateway Arch landmark.',
    terrain: 'Ozark Mountains, Mississippi River plain, prairie',
    majorAirports: ['KSTL', 'KMCI', 'KSGF'],
    attractions: ['Gateway Arch', 'Branson', 'Mark Twain National Forest'],
    funFact: 'Home to the world\'s first ice cream cone!',
    avgElevation: 800, climate: 'Humid continental'
  },
  MT: {
    state: 'MT', stateName: 'Montana', nickname: 'Big Sky Country', capital: 'Helena',
    region: 'West', bio: 'Big Sky Country offers pristine wilderness and epic mountain scenery.',
    terrain: 'Rocky Mountains, plains, glacier lakes',
    majorAirports: ['KBIL', 'KGTF', 'KGTF'],
    attractions: ['Glacier National Park', 'Yellowstone nearby', 'Flathead Lake'],
    funFact: 'Has the largest migratory elk herd in the nation!',
    avgElevation: 3400, climate: 'Semi-arid to alpine'
  },
  NE: {
    state: 'NE', stateName: 'Nebraska', nickname: 'Cornhusker State', capital: 'Lincoln',
    region: 'Midwest', bio: 'The Cornhusker State is known for agriculture and pioneering history.',
    terrain: 'Sandhills, plains, Missouri River bluffs',
    majorAirports: ['KOMA', 'KLNK', 'KBFF'],
    attractions: ['Chimney Rock', 'Sandhills', 'Carhenge'],
    funFact: 'Contains the largest hand-planted forest in the world!',
    avgElevation: 2600, climate: 'Semi-arid continental'
  },
  NV: {
    state: 'NV', stateName: 'Nevada', nickname: 'Silver State', capital: 'Carson City',
    region: 'West', bio: 'The Silver State is famous for Las Vegas and the Great Basin desert.',
    terrain: 'Great Basin desert, Sierra Nevada, Mojave Desert',
    majorAirports: ['KLAS', 'KRNO', 'KEly'],
    attractions: ['Las Vegas Strip', 'Lake Tahoe', 'Great Basin National Park'],
    funFact: 'Gambling was legalized in 1931 and it was the 36th state!',
    avgElevation: 5500, climate: 'Desert to alpine'
  },
  NH: {
    state: 'NH', stateName: 'New Hampshire', nickname: 'Granite State', capital: 'Concord',
    region: 'Northeast', bio: 'The Granite State offers mountain peaks and New England charm.',
    terrain: 'White Mountains, Lakes Region, coastal plain',
    majorAirports: ['KMHT', 'KPSM', 'KASH'],
    attractions: ['Mount Washington', 'Lake Winnipesaukee', 'Old Man of the Mountain'],
    funFact: 'First in the nation to hold presidential primary!',
    avgElevation: 1000, climate: 'Humid continental'
  },
  NJ: {
    state: 'NJ', stateName: 'New Jersey', nickname: 'Garden State', capital: 'Trenton',
    region: 'Northeast', bio: 'The Garden State offers beaches, casinos, and diverse attractions.',
    terrain: 'Pinelands, Jersey Shore, Palisades',
    majorAirports: ['KEWR', 'KTTN', 'KACY'],
    attractions: ['Atlantic City', 'Cape May', 'Statue of Liberty nearby'],
    funFact: 'More diners than any other state - over 600!',
    avgElevation: 250, climate: 'Humid subtropical'
  },
  NM: {
    state: 'NM', stateName: 'New Mexico', nickname: 'Land of Enchantment', capital: 'Santa Fe',
    region: 'West', bio: 'The Land of Enchantment blends Native American and Spanish cultures.',
    terrain: 'Deserts, mountains, high plains, volcanoes',
    majorAirports: ['KABQ', 'KHOB', 'KSRR'],
    attractions: ['Santa Fe Plaza', 'Carlsbad Caverns', 'White Sands'],
    funFact: 'Developed the atomic bomb at Los Alamos!',
    avgElevation: 5700, climate: 'Desert to alpine'
  },
  NY: {
    state: 'NY', stateName: 'New York', nickname: 'Empire State', capital: 'Albany',
    region: 'Northeast', bio: 'The Empire State is the gateway to America with NYC as its heart.',
    terrain: 'Adirondack Mountains, Catskills, Hudson Valley, Long Island',
    majorAirports: ['KJFK', 'KLGA', 'KEWR', 'KBUF'],
    attractions: ['NYC Times Square', 'Niagara Falls', 'Adirondack Park'],
    funFact: 'NYC has more airports than any city in the US!',
    avgElevation: 1000, climate: 'Humid continental'
  },
  NC: {
    state: 'NC', stateName: 'North Carolina', nickname: 'Tar Heel State', capital: 'Raleigh',
    region: 'South', bio: 'The Tar Heel State offers mountains to sea with Research Triangle innovation.',
    terrain: 'Appalachian Mountains, Piedmont, Outer Banks',
    majorAirports: ['KCLT', 'KRDU', 'KAVL'],
    attractions: ['Wright Brothers Memorial', 'Biltmore Estate', 'Outer Banks'],
    funFact: 'First powered flight by the Wright brothers in 1903!',
    avgElevation: 700, climate: 'Humid subtropical'
  },
  ND: {
    state: 'ND', stateName: 'North Dakota', nickname: 'Flickertail State', capital: 'Bismarck',
    region: 'Midwest', bio: 'The Flickertail State offers pristine prairies and Badlands.',
    terrain: 'Prairies, Badlands, Missouri River',
    majorAirports: ['KBIS', 'KFAR', 'KDVL'],
    attractions: ['Theodore Roosevelt National Park', 'Badlands', 'Peace Garden'],
    funFact: 'Has one of the lowest population densities in the US!',
    avgElevation: 1900, climate: 'Continental'
  },
  OH: {
    state: 'OH', stateName: 'Ohio', nickname: 'Buckeye State', capital: 'Columbus',
    region: 'Midwest', bio: 'The Buckeye State is the birthplace of aviation and presidents.',
    terrain: 'Lake Erie shore, Appalachian foothills, fertile plains',
    majorAirports: ['KCMH', 'KCLE', 'KDAY'],
    attractions: ['Rock & Roll Hall of Fame', 'Cedar Point', 'Hocking Hills'],
    funFact: 'More astronauts have come from Ohio than any other state!',
    avgElevation: 850, climate: 'Humid continental'
  },
  OK: {
    state: 'OK', stateName: 'Oklahoma', nickname: 'Sooner State', capital: 'Oklahoma City',
    region: 'South', bio: 'The Sooner State blends Native American heritage with cowboy culture.',
    terrain: 'Great Plains, Ozark Mountains, Red River Valley',
    majorAirports: ['KOKC', 'KTUL', 'KLAW'],
    attractions: ['Route 66', 'Oklahoma City National Memorial', 'Tallgrass Prairie'],
    funFact: 'The name Oklahoma means \"red people\" in Choctaw!',
    avgElevation: 1300, climate: 'Semi-arid continental'
  },
  OR: {
    state: 'OR', stateName: 'Oregon', nickname: 'Beaver State', capital: 'Salem',
    region: 'West', bio: 'The Beaver State offers coast, mountains, and unique Portland culture.',
    terrain: 'Coast Range, Cascade Mountains, high desert',
    majorAirports: ['KPDX', 'KEUG', 'KMFR'],
    attractions: ['Crater Lake', 'Columbia River Gorge', 'Portland Food Scene'],
    funFact: 'No sales tax - one of only 5 states without it!',
    avgElevation: 3200, climate: 'Marine to desert'
  },
  PA: {
    state: 'PA', stateName: 'Pennsylvania', nickname: 'Keystone State', capital: 'Harrisburg',
    region: 'Northeast', bio: 'The Keystone State bridges colonial history with modern industry.',
    terrain: 'Allegheny Mountains, Philadelphia suburbs, Pocono Mountains',
    majorAirports: ['KPHL', 'KPIT', 'KMDT'],
    attractions: ['Independence Hall', 'Gettysburg', 'Hersheypark'],
    funFact: 'The first computer was built at the University of Pennsylvania!',
    avgElevation: 1100, climate: 'Humid continental'
  },
  RI: {
    state: 'RI', stateName: 'Rhode Island', nickname: 'Ocean State', capital: 'Providence',
    region: 'Northeast', bio: 'The smallest state with the longest name but big coastal character.',
    terrain: 'Narragansett Bay, islands, coastal plain',
    majorAirports: ['KPVD', 'KWST'],
    attractions: ['Newport Mansions', 'Block Island', 'Providence'],
    funFact: 'Formal name is \"State of Rhode Island and Providence Plantations\"!',
    avgElevation: 200, climate: 'Humid continental'
  },
  SC: {
    state: 'SC', stateName: 'South Carolina', nickname: 'Palmetto State', capital: 'Columbia',
    region: 'South', bio: 'The Palmetto State blends antebellum history with beach resorts.',
    terrain: 'Coastal plain, Blue Ridge foothills, Sea Islands',
    majorAirports: ['KCLT', 'KCHS', 'KGSP'],
    attractions: ['Myrtle Beach', 'Charleston Historic District', 'Hilton Head'],
    funFact: 'First state to secede from the Union in 1860!',
    avgElevation: 350, climate: 'Humid subtropical'
  },
  SD: {
    state: 'SD', stateName: 'South Dakota', nickname: 'Mount Rushmore State', capital: 'Pierre',
    region: 'Midwest', bio: 'Home to Mount Rushmore and the Badlands with Native American heritage.',
    terrain: 'Badlands, Black Hills, Great Plains',
    majorAirports: ['KFSD', 'KRCA', 'KABR'],
    attractions: ['Mount Rushmore', 'Badlands National Park', 'Crazy Horse Monument'],
    funFact: 'Mount Rushmore was completed in 1941 after 14 years of work!',
    avgElevation: 2200, climate: 'Continental'
  },
  TN: {
    state: 'TN', stateName: 'Tennessee', nickname: 'Volunteer State', capital: 'Nashville',
    region: 'South', bio: 'The Volunteer State is the birthplace of country music.',
    terrain: 'Great Smoky Mountains, Nashville basin, Mississippi flood plain',
    majorAirports: ['KBNA', 'KMEM', 'KTRI'],
    attractions: ['Nashville Music Row', 'Great Smoky Mountains', 'Memphis Beale Street'],
    funFact: 'More recorded music comes from Nashville than anywhere else!',
    avgElevation: 900, climate: 'Humid subtropical'
  },
  TX: {
    state: 'TX', stateName: 'Texas', nickname: 'Lone Star State', capital: 'Austin',
    region: 'South', bio: 'The Lone Star State is huge with diverse landscapes and culture.',
    terrain: 'Deserts, mountains, Gulf Coast, plains',
    majorAirports: ['KDFW', 'KIAH', 'KLAX', 'K AUS'],
    attractions: ['Austin Live Music', 'Houston Space Center', 'Big Bend'],
    funFact: 'If Texas was a country, it would have the 10th largest economy!',
    avgElevation: 1700, climate: 'Desert to subtropical'
  },
  UT: {
    state: 'UT', stateName: 'Utah', nickname: 'Beehive State', capital: 'Salt Lake City',
    region: 'West', bio: 'The Beehive State has world-famous national parks and ski resorts.',
    terrain: 'Rocky Mountains, Canyonlands, Great Salt Lake',
    majorAirports: ['KSLC', 'KPRO', 'KCDC'],
    attractions: [' Zion National Park', 'Ski Resorts', 'Salt Lake Temple'],
    funFact: 'Home to the world\'s largest open pit mine - Bingham Canyon!',
    avgElevation: 6100, climate: 'Desert to alpine'
  },
  VT: {
    state: 'VT', stateName: 'Vermont', nickname: 'Green Mountain State', capital: 'Montpelier',
    region: 'Northeast', bio: 'The Green Mountain State is known for fall foliage and maple syrup.',
    terrain: 'Green Mountains, Lake Champlain, forests',
    majorAirports: ['KBTV', 'KRUT', 'KMVL'],
    attractions: ['Stowe Ski Resort', 'Fall Foliage', 'Ben & Jerry\'s Factory'],
    funFact: 'Produces more maple syrup than any other US state!',
    avgElevation: 1000, climate: 'Humid continental'
  },
  VA: {
    state: 'VA', stateName: 'Virginia', nickname: 'Old Dominion', capital: 'Richmond',
    region: 'South', bio: 'The Old Dominion offers colonial history and mountain adventures.',
    terrain: 'Blue Ridge Mountains, Chesapeake Bay, Tidewater region',
    majorAirports: ['KIAD', 'KDCA', 'KRIC'],
    attractions: ['Jamestown', 'Virginia Beach', 'Shenandoah National Park'],
    funFact: 'First English settlement in America was at Jamestown in 1607!',
    avgElevation: 950, climate: 'Humid subtropical'
  },
  WA: {
    state: 'WA', stateName: 'Washington', nickname: 'Evergreen State', capital: 'Olympia',
    region: 'West', bio: 'The Evergreen State has tech hubs, rainforests, and volcanoes.',
    terrain: 'Cascade Range, Puget Sound, Olympic Peninsula',
    majorAirports: ['KSEA', 'KGEG', 'KPAE'],
    attractions: ['Mount Rainier', 'Seattle Space Needle', 'Olympic National Park'],
    funFact: 'Has more glaciers than any other state in the lower 48!',
    avgElevation: 1700, climate: 'Marine to alpine'
  },
  WV: {
    state: 'WV', stateName: 'West Virginia', nickname: 'Mountain State', capital: 'Charleston',
    region: 'South', bio: 'The Mountain State offers whitewater rafting and Appalachian culture.',
    terrain: 'Appalachian Mountains, coal country, rivers',
    majorAirports: ['KCRW', 'KHTS', 'KMGW'],
    attractions: ['New River Gorge', 'Snowshoe Ski Resort', 'Harpers Ferry'],
    funFact: 'The New River Gorge Bridge is the longest steel arch bridge in the US!',
    avgElevation: 1500, climate: 'Humid continental'
  },
  WI: {
    state: 'WI', stateName: 'Wisconsin', nickname: 'Badger State', capital: 'Madison',
    region: 'Midwest', bio: 'The Badger State is known for cheese, breweries, and football.',
    terrain: 'Great Lakes shore, driftless area, Northwoods',
    majorAirports: ['KMKE', 'KMSN', 'KGRB'],
    attractions: ['Milwaukee Breweries', 'Wisconsin Dells', 'Green Bay Packers'],
    funFact: 'Calls itself \"America\'s Dairyland\" - produces more cheese than any state!',
    avgElevation: 1050, climate: 'Humid continental'
  },
  WY: {
    state: 'WY', stateName: 'Wyoming', nickname: 'Equality State', capital: 'Cheyenne',
    region: 'West', bio: 'The Equality State has the least population and most wildlife in the US.',
    terrain: 'Rocky Mountains, Great Plains, Yellowstone',
    majorAirports: ['KCPR', 'KJAC', 'KWRL'],
    attractions: ['Yellowstone', 'Grand Teton', 'Devils Tower'],
    funFact: 'First state to grant women the right to vote in 1869!',
    avgElevation: 6700, climate: 'Continental'
  },
  DC: {
    state: 'DC', stateName: 'Washington D.C.', nickname: 'Nation\'s Capital', capital: 'Washington',
    region: 'Northeast', bio: 'The US capital is home to monuments, museums, and government.',
    terrain: 'Potomac River, Anacostia, urban landscape',
    majorAirports: ['KDCA', 'KIAD', 'KBWI'],
    attractions: ['Lincoln Memorial', 'Smithsonian Museums', 'Capitol Building'],
    funFact: 'No state - it\'s a federal district governed by Congress!',
    avgElevation: 150, climate: 'Humid subtropical'
  }
};

export function getStateInfo(stateCode: string): StateInfo | undefined {
  return stateData[stateCode];
}

export function getAllStates(): StateInfo[] {
  return Object.values(stateData);
}
