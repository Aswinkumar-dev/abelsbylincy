/**
 * Australian States and Major Suburbs Database with Postcodes
 */

export const AUSTRALIAN_STATES = [
  { code: 'NSW', name: 'New South Wales (NSW)' },
  { code: 'VIC', name: 'Victoria (VIC)' },
  { code: 'QLD', name: 'Queensland (QLD)' },
  { code: 'WA', name: 'Western Australia (WA)' },
  { code: 'SA', name: 'South Australia (SA)' },
  { code: 'TAS', name: 'Tasmania (TAS)' },
  { code: 'ACT', name: 'Australian Capital Territory (ACT)' },
  { code: 'NT', name: 'Northern Territory (NT)' }
];

export const AUSTRALIAN_SUBURBS = [
  // NSW - Sydney & Regional
  { name: 'Sydney', state: 'NSW', postcode: '2000' },
  { name: 'Haymarket', state: 'NSW', postcode: '2000' },
  { name: 'Surry Hills', state: 'NSW', postcode: '2010' },
  { name: 'Darlinghurst', state: 'NSW', postcode: '2010' },
  { name: 'Paddington', state: 'NSW', postcode: '2021' },
  { name: 'Bondi', state: 'NSW', postcode: '2026' },
  { name: 'Bondi Beach', state: 'NSW', postcode: '2026' },
  { name: 'Bondi Junction', state: 'NSW', postcode: '2022' },
  { name: 'Coogee', state: 'NSW', postcode: '2034' },
  { name: 'Randwick', state: 'NSW', postcode: '2031' },
  { name: 'Mascot', state: 'NSW', postcode: '2020' },
  { name: 'Alexandria', state: 'NSW', postcode: '2015' },
  { name: 'Newtown', state: 'NSW', postcode: '2042' },
  { name: 'Marrickville', state: 'NSW', postcode: '2204' },
  { name: 'North Sydney', state: 'NSW', postcode: '2060' },
  { name: 'Chatswood', state: 'NSW', postcode: '2067' },
  { name: 'Mosman', state: 'NSW', postcode: '2088' },
  { name: 'Manly', state: 'NSW', postcode: '2095' },
  { name: 'Dee Why', state: 'NSW', postcode: '2099' },
  { name: 'Ryde', state: 'NSW', postcode: '2112' },
  { name: 'Macquarie Park', state: 'NSW', postcode: '2113' },
  { name: 'Strathfield', state: 'NSW', postcode: '2135' },
  { name: 'Burwood', state: 'NSW', postcode: '2134' },
  { name: 'Parramatta', state: 'NSW', postcode: '2150' },
  { name: 'Westmead', state: 'NSW', postcode: '2145' },
  { name: 'Castle Hill', state: 'NSW', postcode: '2154' },
  { name: 'Baulkham Hills', state: 'NSW', postcode: '2153' },
  { name: 'Blacktown', state: 'NSW', postcode: '2148' },
  { name: 'Penrith', state: 'NSW', postcode: '2750' },
  { name: 'Liverpool', state: 'NSW', postcode: '2170' },
  { name: 'Campbelltown', state: 'NSW', postcode: '2560' },
  { name: 'Cronulla', state: 'NSW', postcode: '2230' },
  { name: 'Hurstville', state: 'NSW', postcode: '2220' },
  { name: 'Wollongong', state: 'NSW', postcode: '2500' },
  { name: 'Newcastle', state: 'NSW', postcode: '2300' },
  { name: 'Gosford', state: 'NSW', postcode: '2250' },
  { name: 'Byron Bay', state: 'NSW', postcode: '2481' },
  { name: 'Tweed Heads', state: 'NSW', postcode: '2485' },
  { name: 'Coffs Harbour', state: 'NSW', postcode: '2450' },
  { name: 'Port Macquarie', state: 'NSW', postcode: '2444' },
  { name: 'Orange', state: 'NSW', postcode: '2800' },
  { name: 'Dubbo', state: 'NSW', postcode: '2830' },
  { name: 'Wagga Wagga', state: 'NSW', postcode: '2650' },
  { name: 'Albury', state: 'NSW', postcode: '2640' },
  { name: 'Tamworth', state: 'NSW', postcode: '2340' },

  // VIC - Melbourne & Regional
  { name: 'Melbourne', state: 'VIC', postcode: '3000' },
  { name: 'East Melbourne', state: 'VIC', postcode: '3002' },
  { name: 'West Melbourne', state: 'VIC', postcode: '3003' },
  { name: 'Southbank', state: 'VIC', postcode: '3006' },
  { name: 'Docklands', state: 'VIC', postcode: '3008' },
  { name: 'Carlton', state: 'VIC', postcode: '3053' },
  { name: 'Fitzroy', state: 'VIC', postcode: '3065' },
  { name: 'Collingwood', state: 'VIC', postcode: '3066' },
  { name: 'Richmond', state: 'VIC', postcode: '3121' },
  { name: 'South Yarra', state: 'VIC', postcode: '3141' },
  { name: 'Prahran', state: 'VIC', postcode: '3181' },
  { name: 'St Kilda', state: 'VIC', postcode: '3182' },
  { name: 'Brighton', state: 'VIC', postcode: '3186' },
  { name: 'Toorak', state: 'VIC', postcode: '3142' },
  { name: 'Hawthorn', state: 'VIC', postcode: '3122' },
  { name: 'Camberwell', state: 'VIC', postcode: '3124' },
  { name: 'Box Hill', state: 'VIC', postcode: '3128' },
  { name: 'Doncaster', state: 'VIC', postcode: '3108' },
  { name: 'Glen Waverley', state: 'VIC', postcode: '3150' },
  { name: 'Clayton', state: 'VIC', postcode: '3168' },
  { name: 'Dandenong', state: 'VIC', postcode: '3175' },
  { name: 'Frankston', state: 'VIC', postcode: '3199' },
  { name: 'Mornington', state: 'VIC', postcode: '3931' },
  { name: 'Brunswick', state: 'VIC', postcode: '3056' },
  { name: 'Coburg', state: 'VIC', postcode: '3058' },
  { name: 'Preston', state: 'VIC', postcode: '3072' },
  { name: 'Footscray', state: 'VIC', postcode: '3011' },
  { name: 'Werribee', state: 'VIC', postcode: '3030' },
  { name: 'Geelong', state: 'VIC', postcode: '3220' },
  { name: 'Ballarat', state: 'VIC', postcode: '3350' },
  { name: 'Bendigo', state: 'VIC', postcode: '3550' },
  { name: 'Shepparton', state: 'VIC', postcode: '3630' },
  { name: 'Warrnambool', state: 'VIC', postcode: '3280' },
  { name: 'Mildura', state: 'VIC', postcode: '3500' },

  // QLD - Brisbane, Gold Coast & Regional
  { name: 'Brisbane City', state: 'QLD', postcode: '4000' },
  { name: 'South Brisbane', state: 'QLD', postcode: '4101' },
  { name: 'Fortitude Valley', state: 'QLD', postcode: '4006' },
  { name: 'New Farm', state: 'QLD', postcode: '4005' },
  { name: 'West End', state: 'QLD', postcode: '4101' },
  { name: 'Spring Hill', state: 'QLD', postcode: '4000' },
  { name: 'Paddington', state: 'QLD', postcode: '4064' },
  { name: 'Milton', state: 'QLD', postcode: '4064' },
  { name: 'Toowong', state: 'QLD', postcode: '4066' },
  { name: 'Indooroopilly', state: 'QLD', postcode: '4068' },
  { name: 'St Lucia', state: 'QLD', postcode: '4067' },
  { name: 'Chermside', state: 'QLD', postcode: '4032' },
  { name: 'Carindale', state: 'QLD', postcode: '4152' },
  { name: 'Mount Gravatt', state: 'QLD', postcode: '4122' },
  { name: 'Sunnybank', state: 'QLD', postcode: '4109' },
  { name: 'Ipswich', state: 'QLD', postcode: '4305' },
  { name: 'Logan Central', state: 'QLD', postcode: '4114' },
  { name: 'Surfers Paradise', state: 'QLD', postcode: '4217' },
  { name: 'Broadbeach', state: 'QLD', postcode: '4218' },
  { name: 'Southport', state: 'QLD', postcode: '4215' },
  { name: 'Burleigh Heads', state: 'QLD', postcode: '4220' },
  { name: 'Robina', state: 'QLD', postcode: '4226' },
  { name: 'Coolangatta', state: 'QLD', postcode: '4225' },
  { name: 'Maroochydore', state: 'QLD', postcode: '4558' },
  { name: 'Noosa Heads', state: 'QLD', postcode: '4567' },
  { name: 'Caloundra', state: 'QLD', postcode: '4551' },
  { name: 'Toowoomba', state: 'QLD', postcode: '4350' },
  { name: 'Cairns', state: 'QLD', postcode: '4870' },
  { name: 'Townsville', state: 'QLD', postcode: '4810' },
  { name: 'Mackay', state: 'QLD', postcode: '4740' },
  { name: 'Rockhampton', state: 'QLD', postcode: '4700' },
  { name: 'Bundaberg', state: 'QLD', postcode: '4670' },
  { name: 'Hervey Bay', state: 'QLD', postcode: '4655' },

  // WA - Perth & Regional
  { name: 'Perth', state: 'WA', postcode: '6000' },
  { name: 'West Perth', state: 'WA', postcode: '6005' },
  { name: 'East Perth', state: 'WA', postcode: '6004' },
  { name: 'Northbridge', state: 'WA', postcode: '6003' },
  { name: 'Subiaco', state: 'WA', postcode: '6008' },
  { name: 'Claremont', state: 'WA', postcode: '6010' },
  { name: 'Cottesloe', state: 'WA', postcode: '6011' },
  { name: 'Fremantle', state: 'WA', postcode: '6160' },
  { name: 'Scarborough', state: 'WA', postcode: '6019' },
  { name: 'Joondalup', state: 'WA', postcode: '6027' },
  { name: 'Midland', state: 'WA', postcode: '6056' },
  { name: 'Victoria Park', state: 'WA', postcode: '6100' },
  { name: 'Mandurah', state: 'WA', postcode: '6210' },
  { name: 'Bunbury', state: 'WA', postcode: '6230' },
  { name: 'Albany', state: 'WA', postcode: '6330' },
  { name: 'Geraldton', state: 'WA', postcode: '6530' },
  { name: 'Kalgoorlie', state: 'WA', postcode: '6430' },
  { name: 'Broome', state: 'WA', postcode: '6725' },

  // SA - Adelaide & Regional
  { name: 'Adelaide', state: 'SA', postcode: '5000' },
  { name: 'North Adelaide', state: 'SA', postcode: '5006' },
  { name: 'Norwood', state: 'SA', postcode: '5067' },
  { name: 'Unley', state: 'SA', postcode: '5061' },
  { name: 'Glenelg', state: 'SA', postcode: '5045' },
  { name: 'Brighton', state: 'SA', postcode: '5048' },
  { name: 'Prospect', state: 'SA', postcode: '5082' },
  { name: 'Port Adelaide', state: 'SA', postcode: '5015' },
  { name: 'Mawson Lakes', state: 'SA', postcode: '5095' },
  { name: 'Marion', state: 'SA', postcode: '5043' },
  { name: 'Mount Barker', state: 'SA', postcode: '5251' },
  { name: 'Victor Harbor', state: 'SA', postcode: '5211' },
  { name: 'Mount Gambier', state: 'SA', postcode: '5290' },
  { name: 'Whyalla', state: 'SA', postcode: '5600' },
  { name: 'Port Lincoln', state: 'SA', postcode: '5606' },

  // TAS - Hobart & Regional
  { name: 'Hobart', state: 'TAS', postcode: '7000' },
  { name: 'Sandy Bay', state: 'TAS', postcode: '7005' },
  { name: 'Battery Point', state: 'TAS', postcode: '7004' },
  { name: 'North Hobart', state: 'TAS', postcode: '7000' },
  { name: 'Glenorchy', state: 'TAS', postcode: '7010' },
  { name: 'Kingston', state: 'TAS', postcode: '7050' },
  { name: 'Launceston', state: 'TAS', postcode: '7250' },
  { name: 'Devonport', state: 'TAS', postcode: '7310' },
  { name: 'Burnie', state: 'TAS', postcode: '7320' },

  // ACT - Canberra
  { name: 'Canberra', state: 'ACT', postcode: '2600' },
  { name: 'Barton', state: 'ACT', postcode: '2600' },
  { name: 'Kingston', state: 'ACT', postcode: '2604' },
  { name: 'Manuka', state: 'ACT', postcode: '2603' },
  { name: 'Braddon', state: 'ACT', postcode: '2612' },
  { name: 'Belconnen', state: 'ACT', postcode: '2617' },
  { name: 'Gungahlin', state: 'ACT', postcode: '2912' },
  { name: 'Tuggeranong', state: 'ACT', postcode: '2900' },
  { name: 'Woden', state: 'ACT', postcode: '2606' },

  // NT - Darwin & Regional
  { name: 'Darwin', state: 'NT', postcode: '0800' },
  { name: 'Casuarina', state: 'NT', postcode: '0810' },
  { name: 'Palmerston', state: 'NT', postcode: '0830' },
  { name: 'Alice Springs', state: 'NT', postcode: '0870' },
  { name: 'Katherine', state: 'NT', postcode: '0850' }
];

/**
 * Validates and formats Australian phone numbers
 * Accepts: 04XX XXX XXX (mobile), (02) XXXX XXXX (landline), or with +61
 */
export function formatAustralianPhone(value) {
  if (!value) return '';
  // Clean all characters except digits and plus
  let cleaned = String(value).replace(/[^0-9+]/g, '');
  
  // Convert +61... or 61... to 0...
  if (cleaned.startsWith('+61')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('61') && cleaned.length > 9) {
    cleaned = '0' + cleaned.slice(2);
  }

  // Keep only digits
  const digits = cleaned.replace(/\D/g, '').slice(0, 10);

  // Format Australian Mobile (04XX XXX XXX)
  if (digits.startsWith('04')) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  }

  // Format Australian Landline (02, 03, 07, 08)
  if (digits.startsWith('02') || digits.startsWith('03') || digits.startsWith('07') || digits.startsWith('08')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
  }

  return digits;
}

export function isValidAustralianPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  // Must be 10 digits starting with 04 (mobile) or 02, 03, 07, 08 (landline)
  if (digits.length !== 10) return false;
  return /^(04|02|03|07|08)\d{8}$/.test(digits);
}

export function getStateFromPostcode(postcode) {
  const p = parseInt(postcode, 10);
  if (isNaN(p)) return '';
  if ((p >= 1000 && p <= 1999) || (p >= 2000 && p <= 2599) || (p >= 2619 && p <= 2899) || (p >= 2921 && p <= 2999)) return 'NSW';
  if ((p >= 200 && p <= 299) || (p >= 2600 && p <= 2618) || (p >= 2900 && p <= 2920)) return 'ACT';
  if ((p >= 3000 && p <= 3999) || (p >= 8000 && p <= 8999)) return 'VIC';
  if ((p >= 4000 && p <= 4999) || (p >= 9000 && p <= 9999)) return 'QLD';
  if (p >= 5000 && p <= 5799) return 'SA';
  if (p >= 6000 && p <= 6797) return 'WA';
  if (p >= 7000 && p <= 7799) return 'TAS';
  if (p >= 800 && p <= 899) return 'NT';
  return '';
}
