const presidentsData = [
  {
    "id": "washington",
    "name": "George Washington",
    "years": "1789\u20131797",
    "lifespan": "1732\u20131799",
    "party": "Independent",
    "partyColor": "white",
    "startYear": 1789,
    "endYear": 1797,
    "events": [
      "Whiskey Rebellion",
      "Bill of Rights ratified",
      "Farewell Address"
    ],
    "summary": "George Washington, the 'Father of His Country,' served as the first President of the United States, providing a steady hand that defined the executive office. His leadership during the Revolutionary War and his presiding over the Constitutional Convention made him the only choice for the fledgling nation's first executive. Washington\u2019s two terms established vital precedents, including the cabinet system and the two-term limit, and he famously warned against the 'baneful effects' of political parties and permanent foreign alliances in his Farewell Address.",
    "portraitUrl": "President Portraits/washington.jpg"
  },
  {
    "id": "adams-john",
    "name": "John Adams",
    "years": "1797\u20131801",
    "lifespan": "1735\u20131826",
    "party": "Federalist",
    "partyColor": "white",
    "startYear": 1797,
    "endYear": 1801,
    "events": [
      "XYZ Affair",
      "Alien and Sedition Acts",
      "Midnight Appointments"
    ],
    "summary": "John Adams, a primary architect of American independence, faced a presidency defined by international tension and domestic strife. His term was overshadowed by the Quasi-War with France and the controversial Alien and Sedition Acts, which were designed to quell dissent but instead fueled political opposition. Adams was the first president to reside in the White House, though his tenure ended in a bitter defeat to Thomas Jefferson, marking the first peaceful transfer of power between opposing political factions.",
    "portraitUrl": "President Portraits/adams-john.jpg"
  },
  {
    "id": "jefferson",
    "name": "Thomas Jefferson",
    "years": "1801\u20131809",
    "lifespan": "1743\u20131826",
    "party": "Democratic-Republican",
    "partyColor": "white",
    "startYear": 1801,
    "endYear": 1809,
    "events": [
      "Louisiana Purchase",
      "Lewis and Clark Expedition",
      "Embargo Act of 1807"
    ],
    "summary": "Thomas Jefferson\u2019s presidency was marked by the massive expansion of the United States and a commitment to agrarian democracy. His purchase of the Louisiana Territory from France doubled the size of the nation, while the Lewis and Clark Expedition opened the West to future settlement. Jefferson\u2019s vision of a 'yeoman republic' focused on decentralized power, though his second term was complicated by the Embargo Act, which severely damaged the American economy in an attempt to maintain neutrality in European conflicts.",
    "portraitUrl": "President Portraits/jefferson.jpg"
  },
  {
    "id": "madison",
    "name": "James Madison",
    "years": "1809\u20131817",
    "lifespan": "1751\u20131836",
    "party": "Democratic-Republican",
    "partyColor": "white",
    "startYear": 1809,
    "endYear": 1817,
    "events": [
      "War of 1812",
      "Burning of Washington",
      "Treaty of Ghent"
    ],
    "summary": "James Madison, the 'Father of the Constitution,' led the nation through the War of 1812, the first major conflict under the new federal government. The war, often called the 'Second War of Independence,' saw the burning of the White House by British forces but ultimately resulted in a surge of American nationalism. Madison's presidency navigated the transition from the Revolutionary generation to a new era of westward expansion and industrial growth.",
    "portraitUrl": "President Portraits/madison.jpg"
  },
  {
    "id": "monroe",
    "name": "James Monroe",
    "years": "1817\u20131825",
    "lifespan": "1758\u20131831",
    "party": "Democratic-Republican",
    "partyColor": "white",
    "startYear": 1817,
    "endYear": 1825,
    "events": [
      "Monroe Doctrine",
      "Missouri Compromise",
      "Era of Good Feelings"
    ],
    "summary": "James Monroe presided over the 'Era of Good Feelings,' a period of relative political unity and westward expansion. His most enduring legacy, the Monroe Doctrine, asserted that the Western Hemisphere was closed to further European colonization, establishing a cornerstone of American foreign policy. Domestically, his term saw the first major sectional crisis over slavery, which was temporarily quelled by the Missouri Compromise of 1820.",
    "portraitUrl": "President Portraits/monroe.jpg"
  },
  {
    "id": "adams-quincy",
    "name": "John Quincy Adams",
    "years": "1825\u20131829",
    "lifespan": "1767\u20131848",
    "party": "Democratic-Republican",
    "partyColor": "white",
    "startYear": 1825,
    "endYear": 1829,
    "events": [
      "Erie Canal completion",
      "Tariff of Abominations",
      "Chesapeake and Ohio Canal"
    ],
    "summary": "John Quincy Adams, the son of the second president, was a brilliant diplomat whose presidency was hampered by political opposition and accusations of a 'corrupt bargain.' He championed a broad vision of national improvement, including federal funding for roads, canals, and a national university, but found his agenda blocked by the supporters of Andrew Jackson. Adams' post-presidential career in Congress, where he became a leading voice against slavery, arguably overshadowed his four years in the White House.",
    "portraitUrl": "President Portraits/adams-quincy.jpg"
  },
  {
    "id": "jackson",
    "name": "Andrew Jackson",
    "years": "1829\u20131837",
    "lifespan": "1767\u20131845",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1829,
    "endYear": 1837,
    "events": [
      "Indian Removal Act",
      "Nullification Crisis",
      "Bank War"
    ],
    "summary": "Andrew Jackson, the 'Hero of New Orleans,' ushered in the era of Jacksonian Democracy, expanding political power to the 'common man' while strengthening the executive branch. His presidency was marked by fierce battles over the national bank, a firm stand against South Carolina\u2019s attempt to nullify federal law, and the tragic and forced relocation of Native American tribes known as the Trail of Tears. Jackson\u2019s forceful personality and populist appeal fundamentally reshaped American politics and the Democratic Party.",
    "portraitUrl": "President Portraits/jackson.jpg"
  },
  {
    "id": "van-buren",
    "name": "Martin Van Buren",
    "years": "1837\u20131841",
    "lifespan": "1782\u20131862",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1837,
    "endYear": 1841,
    "events": [
      "Panic of 1837",
      "Trail of Tears continuation",
      "Aroostook War"
    ],
    "summary": "Martin Van Buren, a master political strategist, inherited a nation on the brink of economic collapse. The Panic of 1837 defined his term, as banks failed and unemployment soared, leading to his defeat in the following election. Despite his economic troubles, Van Buren was instrumental in the formation of the modern Democratic Party structure and maintained a policy of neutrality in international disputes, though he continued the forced relocation of Native Americans initiated by Jackson.",
    "portraitUrl": "President Portraits/van-buren.jpg"
  },
  {
    "id": "harrison-william",
    "name": "William Harrison",
    "years": "1841",
    "lifespan": "1773\u20131841",
    "party": "Whig",
    "partyColor": "white",
    "startYear": 1841,
    "endYear": 1841,
    "events": [
      "First president to die in office",
      "Longest inauguration speech"
    ],
    "summary": "William Harrison, the hero of the Battle of Tippecanoe, holds the unfortunate distinction of the shortest presidency in American history. After delivering a record-length inauguration speech in the cold rain without a coat, he fell ill and died just 31 days into his term. His death triggered a constitutional crisis over presidential succession, ultimately establishing the precedent that the Vice President becomes the President in every sense of the word.",
    "portraitUrl": "President Portraits/harrison-william.jpg"
  },
  {
    "id": "tyler",
    "name": "John Tyler",
    "years": "1841\u20131845",
    "lifespan": "1790\u20131862",
    "party": "Whig / Independent",
    "partyColor": "white",
    "startYear": 1841,
    "endYear": 1845,
    "events": [
      "Annexation of Texas",
      "Webster-Ashburton Treaty"
    ],
    "summary": "John Tyler, the first Vice President to succeed to the presidency, was a man without a party for most of his term. A staunch believer in states' rights, he repeatedly vetoed his own party's legislation, leading the Whigs to expel him. Despite his political isolation, Tyler successfully navigated the annexation of Texas in his final days in office and resolved several long-standing boundary disputes with Great Britain.",
    "portraitUrl": "President Portraits/tyler.jpg"
  },
  {
    "id": "polk",
    "name": "James Polk",
    "years": "1845\u20131849",
    "lifespan": "1795\u20131849",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1845,
    "endYear": 1849,
    "events": [
      "Mexican\u2013American War",
      "Oregon Treaty",
      "California Gold Rush"
    ],
    "summary": "James Polk was perhaps the most successful 'one-term' president, achieving all his major goals including the massive expansion of U.S. territory to the Pacific. His administration oversaw the Mexican-American War, which resulted in the acquisition of the Southwest and California, and the peaceful resolution of the Oregon boundary dispute with Britain. Polk\u2019s relentless work ethic and focus on Manifest Destiny transformed the United States into a continental power, though it also heightened sectional tensions over the expansion of slavery.",
    "portraitUrl": "President Portraits/polk.jpg"
  },
  {
    "id": "taylor",
    "name": "Zachary Taylor",
    "years": "1849\u20131850",
    "lifespan": "1784\u20131850",
    "party": "Whig",
    "partyColor": "white",
    "startYear": 1849,
    "endYear": 1850,
    "events": [
      "Gold Rush migration",
      "Clayton\u2013Bulwer Treaty"
    ],
    "summary": "Zachary Taylor, a war hero known as 'Old Rough and Ready,' was a political novice whose presidency was cut short by his sudden death. Though a slaveholder himself, Taylor took a surprisingly firm stance against the expansion of slavery into the new territories acquired from Mexico, urging California to apply for statehood as a free state. His death in July 1850 left the resolving of the growing sectional crisis to his successor, Millard Fillmore.",
    "portraitUrl": "President Portraits/taylor.jpg"
  },
  {
    "id": "fillmore",
    "name": "Millard Fillmore",
    "years": "1850\u20131853",
    "lifespan": "1800\u20131874",
    "party": "Whig",
    "partyColor": "white",
    "startYear": 1850,
    "endYear": 1853,
    "events": [
      "Compromise of 1850",
      "Perry Expedition to Japan"
    ],
    "summary": "Millard Fillmore\u2019s presidency was defined by the Compromise of 1850, a series of laws that aimed to preserve the Union but ultimately deepened sectional divisions. By signing the Fugitive Slave Act, Fillmore alienated his Northern Whig base, leading to the eventual collapse of the party. On the international stage, his administration sent Commodore Perry to Japan, opening the isolated nation to American trade and influence.",
    "portraitUrl": "President Portraits/fillmore.jpg"
  },
  {
    "id": "pierce",
    "name": "Franklin Pierce",
    "years": "1853\u20131857",
    "lifespan": "1804\u20131869",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1853,
    "endYear": 1857,
    "events": [
      "Kansas-Nebraska Act",
      "Gadsden Purchase"
    ],
    "summary": "Franklin Pierce, a 'Northern man with Southern principles,' presided over a nation sliding toward civil war. His support for the Kansas-Nebraska Act, which allowed settlers to decide the status of slavery through 'popular sovereignty,' triggered a wave of violence in 'Bleeding Kansas' and destroyed the relative peace established by previous compromises. Pierce's inability to resolve the slavery question made him a deeply unpopular figure, leading his own party to deny him renomination.",
    "portraitUrl": "President Portraits/pierce.jpg"
  },
  {
    "id": "buchanan",
    "name": "James Buchanan",
    "years": "1857\u20131861",
    "lifespan": "1791\u20131868",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1857,
    "endYear": 1861,
    "events": [
      "Dred Scott Decision",
      "John Brown\u2019s Raid",
      "Secession of South Carolina"
    ],
    "summary": "James Buchanan is often cited as one of the least effective presidents for his failure to address the secession crisis that led to the Civil War. His administration saw the inflammatory Dred Scott decision and the rise of the Republican Party, yet Buchanan remained passive as Southern states began to leave the Union following the election of Abraham Lincoln. His belief that the federal government lacked the authority to prevent secession left the nation fractured and on the brink of its bloodiest conflict.",
    "portraitUrl": "President Portraits/buchanan.jpg"
  },
  {
    "id": "lincoln",
    "name": "Abraham Lincoln",
    "years": "1861\u20131865",
    "lifespan": "1809\u20131865",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1861,
    "endYear": 1865,
    "events": [
      "American Civil War",
      "Emancipation Proclamation",
      "Gettysburg Address"
    ],
    "summary": "Abraham Lincoln, arguably the nation's greatest president, preserved the Union and ended the institution of slavery during the darkest chapter of American history. His leadership through the Civil War was characterized by a profound sense of duty, eloquence, and a commitment to the principles of equality set forth in the Declaration of Independence. Lincoln\u2019s Emancipation Proclamation and his Gettysburg Address redefined the American identity, though his life was tragically cut short by an assassin\u2019s bullet just as the war reached its conclusion.",
    "portraitUrl": "President Portraits/lincoln.jpg"
  },
  {
    "id": "johnson-andrew",
    "name": "Andrew Johnson",
    "years": "1865\u20131869",
    "lifespan": "1808\u20131875",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1865,
    "endYear": 1869,
    "events": [
      "Reconstruction begins",
      "Purchase of Alaska",
      "First impeachment"
    ],
    "summary": "Andrew Johnson, who succeeded Lincoln, faced the monumental task of Reconstruction but quickly found himself at odds with the Radical Republicans in Congress. His lenient policies toward the former Confederate states and his opposition to civil rights for formerly enslaved people led to a bitter power struggle and his eventual impeachment, the first in U.S. history. Despite his domestic failures, his administration did secure the purchase of Alaska from Russia, an acquisition initially mocked as 'Seward\u2019s Folly'.",
    "portraitUrl": "President Portraits/johnson-andrew.jpg"
  },
  {
    "id": "grant",
    "name": "Ulysses Grant",
    "years": "1869\u20131877",
    "lifespan": "1822\u20131885",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1869,
    "endYear": 1877,
    "events": [
      "Ratification of 15th Amendment",
      "Civil Rights Act of 1875",
      "Panic of 1873"
    ],
    "summary": "Ulysses Grant, the victorious Union general, sought to bring order to the South and protect the rights of newly freed African Americans during Reconstruction. While his presidency was marred by a series of high-profile corruption scandals among his appointees, Grant himself remained committed to civil rights, using federal power to suppress the Ku Klux Klan. His later years were marked by economic depression and a growing weariness with Reconstruction in the North, leading to a retreat from the reforms he had championed.",
    "portraitUrl": "President Portraits/grant.jpg"
  },
  {
    "id": "hayes",
    "name": "Rutherford Hayes",
    "years": "1877\u20131881",
    "lifespan": "1822\u20131893",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1877,
    "endYear": 1881,
    "events": [
      "End of Reconstruction",
      "Great Railroad Strike of 1877"
    ],
    "summary": "Rutherford Hayes entered office after the most disputed election in history, which was resolved by a compromise that effectively ended Reconstruction. By withdrawing federal troops from the South, Hayes allowed the re-establishment of white supremacist governments, a decision that would lead to decades of Jim Crow laws. His presidency was also marked by the first national labor uprising and his efforts to introduce civil service reform, which were largely resisted by his own party.",
    "portraitUrl": "President Portraits/hayes.jpg"
  },
  {
    "id": "garfield",
    "name": "James Garfield",
    "years": "1881",
    "lifespan": "1831\u20131881",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1881,
    "endYear": 1881,
    "events": [
      "Assassinated (died of infection)",
      "Civil service reform advocacy"
    ],
    "summary": "James Garfield\u2019s presidency was full of promise but tragically brief. An eloquent scholar and war hero, he sought to tackle the 'spoils system' and promote civil rights, but he was shot by a disgruntled office-seeker just four months into his term. His long struggle for life and subsequent death from medical mismanagement galvanized the nation to finally pass the civil service reforms he had championed.",
    "portraitUrl": "President Portraits/garfield.jpg"
  },
  {
    "id": "arthur",
    "name": "Chester Arthur",
    "years": "1881\u20131885",
    "lifespan": "1829\u20131886",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1881,
    "endYear": 1885,
    "events": [
      "Pendleton Civil Service Reform Act",
      "Chinese Exclusion Act"
    ],
    "summary": "Chester Arthur, a man once synonymous with the corrupt 'spoils system,' surprised his critics by becoming a respectable and reform-minded president. He signed the Pendleton Act, which established a merit-based system for federal jobs, and oversaw the modernization of the U.S. Navy. However, his administration also saw the passage of the Chinese Exclusion Act, reflecting the growing anti-immigrant sentiment of the era.",
    "portraitUrl": "President Portraits/arthur.jpg"
  },
  {
    "id": "cleveland-1",
    "name": "Grover Cleveland",
    "years": "1885–1889 & 1893–1897",
    "lifespan": "1837\u20131908",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1885,
    "endYear": 1889,
    "events": [
      "Interstate Commerce Act",
      "Presidential Succession Act"
    ],
    "summary": "Grover Cleveland, the only president to serve non-consecutive terms, was known for his honesty, integrity, and frequent use of the veto. During his first term, he focused on fiscal responsibility and civil service reform, and he signed the Interstate Commerce Act to regulate the railroads. Cleveland\u2019s commitment to the gold standard and lower tariffs defined his economic policy, though he often found himself at odds with both his party and the growing labor movement.",
    "portraitUrl": "President Portraits/cleveland-1.jpg"
  },
  {
    "id": "harrison-benjamin",
    "name": "Benjamin Harrison",
    "years": "1889\u20131893",
    "lifespan": "1833\u20131901",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1889,
    "endYear": 1893,
    "events": [
      "Sherman Antitrust Act",
      "McKinley Tariff",
      "Land Revision Act"
    ],
    "summary": "Benjamin Harrison, the grandson of the ninth president, oversaw a period of significant federal activity and the admission of six new states to the Union. His administration passed the landmark Sherman Antitrust Act to combat monopolies and the highly protectionist McKinley Tariff. Harrison\u2019s focus on American industry and his support for federal voting rights for African Americans made him a key figure in the transition to the modern Republican era.",
    "portraitUrl": "President Portraits/harrison-benjamin.jpg"
  },
  {
    "id": "cleveland-2",
    "name": "Grover Cleveland",
    "years": "1885–1889 & 1893–1897",
    "lifespan": "1837\u20131908",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1893,
    "endYear": 1897,
    "events": [
      "Panic of 1893",
      "Pullman Strike",
      "Utah statehood"
    ],
    "summary": "Grover Cleveland\u2019s second term was dominated by the Panic of 1893, the worst economic depression the nation had yet faced. His handling of the crisis, including his staunch defense of the gold standard and his use of federal troops to break the Pullman Strike, alienated the working-class and populist wings of his party. Cleveland\u2019s non-consecutive terms remain a unique historical footnote, representing a conservative Democratic voice in a rapidly changing industrial landscape.",
    "portraitUrl": "President Portraits/cleveland-2.jpg"
  },
  {
    "id": "mckinley",
    "name": "William McKinley",
    "years": "1897\u20131901",
    "lifespan": "1843\u20131901",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1897,
    "endYear": 1901,
    "events": [
      "Spanish-American War",
      "Annexation of Hawaii",
      "Gold Standard Act"
    ],
    "summary": "William McKinley\u2019s presidency was defined by the transition into the 20th century and the United States' emergence as a global imperial power. Under his leadership, the nation acquired territories in the Caribbean and the Pacific, and McKinley successfully championed the gold standard and high protective tariffs. His second term was cut short by an assassin\u2019s bullet in 1901, leading to the ascension of his dynamic Vice President, Theodore Roosevelt.",
    "portraitUrl": "President Portraits/mckinley.jpg"
  },
  {
    "id": "roosevelt-theodore",
    "name": "Theodore Roosevelt",
    "years": "1901\u20131909",
    "lifespan": "1858\u20131919",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1901,
    "endYear": 1909,
    "events": [
      "Panama Canal",
      "Pure Food and Drug Act",
      "Conservation movement"
    ],
    "summary": "Theodore Roosevelt, a larger-than-life figure, transformed the presidency into a 'bully pulpit' for progressive reform and American strength. His 'Square Deal' aimed to balance the interests of labor, business, and the public, while his trust-busting efforts and conservation initiatives reshaped the national landscape. Roosevelt\u2019s 'Big Stick' diplomacy secured the Panama Canal and established the U.S. as a major player on the world stage, leaving an indelible mark on the 20th century.",
    "portraitUrl": "President Portraits/roosevelt-theodore.jpg"
  },
  {
    "id": "taft",
    "name": "William Howard Taft",
    "years": "1909\u20131913",
    "lifespan": "1857\u20131930",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1909,
    "endYear": 1913,
    "events": [
      "Dollar Diplomacy",
      "16th Amendment (Income Tax)",
      "17th Amendment"
    ],
    "summary": "William Howard Taft, Roosevelt\u2019s hand-picked successor, was a dedicated administrator who actually filed more antitrust suits than his predecessor. However, his more cautious political style and his break with Roosevelt\u2019s progressive wing led to a fractured Republican Party. After his presidency, Taft fulfilled his lifelong ambition by serving as Chief Justice of the Supreme Court, making him the only person to hold both offices.",
    "portraitUrl": "President Portraits/taft.jpg"
  },
  {
    "id": "wilson",
    "name": "Woodrow Wilson",
    "years": "1913\u20131921",
    "lifespan": "1856\u20131924",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1913,
    "endYear": 1921,
    "events": [
      "World War I",
      "Federal Reserve Act",
      "19th Amendment (Women's Suffrage)"
    ],
    "summary": "Woodrow Wilson\u2019s presidency was defined by the transformative 'New Freedom' reforms and the catastrophic events of World War I. His administration established the Federal Reserve and oversaw the passage of the 19th Amendment, granting women the right to vote. Wilson\u2019s 'Fourteen Points' and his push for the League of Nations aimed to create a new international order, though he ultimately failed to secure U.S. membership in the organization he helped conceive.",
    "portraitUrl": "President Portraits/wilson.jpg"
  },
  {
    "id": "harding",
    "name": "Warren Harding",
    "years": "1921\u20131923",
    "lifespan": "1865\u20131923",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1921,
    "endYear": 1923,
    "events": [
      "Teapot Dome Scandal",
      "Washington Naval Conference"
    ],
    "summary": "Warren Harding campaigned on a 'return to normalcy' after the upheaval of World War I, ushering in a period of pro-business policies and economic growth. While personally popular, his presidency was overshadowed by the Teapot Dome scandal and other instances of corruption among his advisors. Harding died suddenly in 1923, before the full extent of the scandals was revealed to the public.",
    "portraitUrl": "President Portraits/harding.jpg"
  },
  {
    "id": "coolidge",
    "name": "Calvin Coolidge",
    "years": "1923\u20131929",
    "lifespan": "1872\u20131933",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1923,
    "endYear": 1929,
    "events": [
      "Roaring Twenties economic boom",
      "Immigration Act of 1924"
    ],
    "summary": "Calvin Coolidge, known as 'Silent Cal,' presided over the height of the Roaring Twenties, a period of unprecedented economic prosperity and cultural change. His commitment to 'laissez-faire' economics and limited government resonated with the era's optimism, as he focused on tax cuts and reducing the national debt. Coolidge\u2019s stoic personality and belief that 'the chief business of the American people is business' came to symbolize the conservative spirit of the decade.",
    "portraitUrl": "President Portraits/coolidge.jpg"
  },
  {
    "id": "hoover",
    "name": "Herbert Hoover",
    "years": "1929\u20131933",
    "lifespan": "1874\u20131964",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1929,
    "endYear": 1933,
    "events": [
      "Stock Market Crash of 1929",
      "Great Depression begins",
      "Bonus Army"
    ],
    "summary": "Herbert Hoover, an accomplished engineer and humanitarian, had the misfortune of entering office just months before the Great Depression began. His reliance on voluntary cooperation and his resistance to direct federal relief were seen as inadequate for the scale of the crisis, making him a scapegoat for the nation's suffering. Despite his failure to stem the depression, Hoover remained an active public figure for decades, serving in various advisory roles under subsequent presidents.",
    "portraitUrl": "President Portraits/hoover.jpg"
  },
  {
    "id": "roosevelt-franklin",
    "name": "Franklin Roosevelt",
    "years": "1933\u20131945",
    "lifespan": "1882\u20131945",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1933,
    "endYear": 1945,
    "events": [
      "The New Deal",
      "World War II",
      "Pearl Harbor"
    ],
    "summary": "Franklin Roosevelt, the only president elected to four terms, led the United States through the dual crises of the Great Depression and World War II. His 'New Deal' programs fundamentally expanded the role of the federal government in the economy, providing a safety net for millions of Americans. Roosevelt\u2019s 'Fireside Chats' and his steady leadership during the war made him a central figure of the 20th century, though his unprecedented tenure led to the eventual ratification of the two-term limit.",
    "portraitUrl": "President Portraits/roosevelt-franklin.jpg"
  },
  {
    "id": "truman",
    "name": "Harry Truman",
    "years": "1945\u20131953",
    "lifespan": "1884\u20131972",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1945,
    "endYear": 1953,
    "events": [
      "Atomic bombings of Japan",
      "The Marshall Plan",
      "The Korean War"
    ],
    "summary": "Harry Truman, who succeeded FDR in the final months of World War II, made the momentous decision to use atomic weapons against Japan. His presidency saw the beginning of the Cold War and the implementation of the Marshall Plan to rebuild Europe. Truman\u2019s 'Fair Deal' sought to continue the legacy of the New Deal, while his decision to desegregate the military and his intervention in Korea defined his commitment to global democracy and civil rights.",
    "portraitUrl": "President Portraits/truman.jpg"
  },
  {
    "id": "eisenhower",
    "name": "Dwight Eisenhower",
    "years": "1953\u20131961",
    "lifespan": "1890\u20131969",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1953,
    "endYear": 1961,
    "events": [
      "Interstate Highway System",
      "Brown v. Board of Education",
      "Sputnik"
    ],
    "summary": "Dwight Eisenhower, the supreme commander of Allied forces in Europe during WWII, presided over a period of economic growth and the relative stability of the 1950s. He oversaw the creation of the Interstate Highway System and navigated the escalating Cold War, while his administration also saw the landmark Brown v. Board of Education ruling that began the desegregation of American schools. Eisenhower\u2019s 'Modern Republicanism' sought to balance fiscal conservatism with the necessary social programs of the era.",
    "portraitUrl": "President Portraits/eisenhower.jpg"
  },
  {
    "id": "kennedy",
    "name": "John Kennedy",
    "years": "1961\u20131963",
    "lifespan": "1917\u20131963",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1961,
    "endYear": 1963,
    "events": [
      "Cuban Missile Crisis",
      "Space Race / Apollo project",
      "Bay of Pigs"
    ],
    "summary": "John Kennedy, the youngest man ever elected to the presidency, brought a sense of youth and idealism to the White House during the height of the Cold War. His 'New Frontier' aimed to tackle poverty and racial injustice, while his handling of the Cuban Missile Crisis avoided a nuclear catastrophe. Kennedy\u2019s tragic assassination in 1963 turned him into a martyr for the causes of civil rights and space exploration, leaving a legacy of hope and 'what might have been'.",
    "portraitUrl": "President Portraits/kennedy.jpg"
  },
  {
    "id": "johnson-lyndon",
    "name": "Lyndon Johnson",
    "years": "1963\u20131969",
    "lifespan": "1908\u20131973",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1963,
    "endYear": 1969,
    "events": [
      "Civil Rights Act of 1964",
      "The Great Society / Medicare",
      "Vietnam War"
    ],
    "summary": "Lyndon Johnson used the political momentum following Kennedy\u2019s death to pass the most significant civil rights and social welfare legislation since the New Deal. His 'Great Society' programs created Medicare, Medicaid, and the Head Start program, while he signed the landmark Civil Rights Act and Voting Rights Act. However, Johnson\u2019s presidency was increasingly overshadowed by the escalation of the Vietnam War, which led to widespread domestic unrest and his decision not to seek re-election.",
    "portraitUrl": "President Portraits/johnson-lyndon.jpg"
  },
  {
    "id": "nixon",
    "name": "Richard Nixon",
    "years": "1969\u20131974",
    "lifespan": "1913\u20131994",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1969,
    "endYear": 1974,
    "events": [
      "Moon landing",
      "Opening to China",
      "Watergate Scandal"
    ],
    "summary": "Richard Nixon\u2019s presidency was marked by significant diplomatic achievements and the first presidential resignation in U.S. history. He successfully navigated the end of the Vietnam War, established relations with China, and oversaw the first moon landing. However, the Watergate scandal and the ensuing cover-up destroyed public trust in the government, leading to his resignation in 1974 just as the nation faced increasing economic and social turmoil.",
    "portraitUrl": "President Portraits/nixon.jpg"
  },
  {
    "id": "ford",
    "name": "Gerald Ford",
    "years": "1974\u20131977",
    "lifespan": "1913\u20132006",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1974,
    "endYear": 1977,
    "events": [
      "Pardoning of Richard Nixon",
      "End of the Vietnam War"
    ],
    "summary": "Gerald Ford, the only person to serve as both Vice President and President without being elected to either office, took the oath of office in the wake of the Watergate scandal. His decision to pardon Richard Nixon was deeply controversial but aimed to heal the nation\u2019s wounds. Ford\u2019s brief presidency focused on stabilizing the economy and overseeing the final withdrawal of American forces from Vietnam, though he ultimately lost his bid for a full term to Jimmy Carter.",
    "portraitUrl": "President Portraits/ford.jpg"
  },
  {
    "id": "carter",
    "name": "Jimmy Carter",
    "years": "1977\u20131981",
    "lifespan": "1924\u2013",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1977,
    "endYear": 1981,
    "events": [
      "Camp David Accords",
      "Iran Hostage Crisis",
      "1979 Energy Crisis"
    ],
    "summary": "Jimmy Carter, a peanut farmer and former governor of Georgia, brought a focus on human rights and ethical leadership to the White House. He successfully brokered the Camp David Accords between Egypt and Israel, but his presidency was plagued by high inflation, an energy crisis, and the 444-day Iran Hostage Crisis. Carter\u2019s post-presidential career in humanitarian work and election monitoring has made him one of the most respected former presidents in history.",
    "portraitUrl": "President Portraits/carter.jpg"
  },
  {
    "id": "reagan",
    "name": "Ronald Reagan",
    "years": "1981\u20131989",
    "lifespan": "1911\u20132004",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1981,
    "endYear": 1989,
    "events": [
      "Reaganomics",
      "INF Treaty",
      "Iran-Contra Affair"
    ],
    "summary": "Ronald Reagan, the 'Great Communicator,' led a conservative revolution that focused on tax cuts, deregulation, and a buildup of the American military. His economic policies, known as 'Reaganomics,' aimed to stimulate growth through 'supply-side' principles, while his firm stance against the Soviet Union and his eventual diplomacy with Mikhail Gorbachev helped bring an end to the Cold War. Reagan\u2019s optimistic personality and his vision of America as a 'shining city on a hill' redefined the Republican Party for a generation.",
    "portraitUrl": "President Portraits/reagan.jpg"
  },
  {
    "id": "bush-herbert",
    "name": "George Herbert Walker Bush",
    "years": "1989\u20131993",
    "lifespan": "1924\u20132018",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 1989,
    "endYear": 1993,
    "events": [
      "Fall of the Berlin Wall",
      "Persian Gulf War",
      "ADA signed"
    ],
    "summary": "George Herbert Walker Bush presided over the end of the Cold War and the liberation of Kuwait during the Persian Gulf War. His extensive experience in foreign policy allowed him to manage the dissolution of the Soviet Union and the reunification of Germany with remarkable skill. Domestically, his administration signed the landmark Americans with Disabilities Act, though he ultimately faced a backlash over a struggling economy and his decision to break a campaign promise not to raise taxes.",
    "portraitUrl": "President Portraits/bush-herbert.jpg"
  },
  {
    "id": "clinton",
    "name": "Bill Clinton",
    "years": "1993\u20132001",
    "lifespan": "1946\u2013",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 1993,
    "endYear": 2001,
    "events": [
      "NAFTA",
      "First federal budget surplus in decades",
      "Impeachment"
    ],
    "summary": "Bill Clinton\u2019s presidency was marked by a period of robust economic growth and the first federal budget surpluses in a generation. He successfully navigated the transition to a post-Cold War world and championed policies like NAFTA and welfare reform. However, his second term was overshadowed by a series of personal scandals and his eventual impeachment, making him only the second president to face a trial in the Senate, where he was ultimately acquitted.",
    "portraitUrl": "President Portraits/clinton.jpg"
  },
  {
    "id": "bush-walker",
    "name": "George Walker Bush",
    "years": "2001\u20132009",
    "lifespan": "1946\u2013",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 2001,
    "endYear": 2009,
    "events": [
      "September 11 Attacks",
      "War on Terror (Iraq/Afghanistan)",
      "2008 Financial Crisis"
    ],
    "summary": "George Walker Bush\u2019s presidency was fundamentally transformed by the September 11 terrorist attacks, leading to a global 'War on Terror' and the invasions of Afghanistan and Iraq. His 'compassionate conservatism' focused on education reform and tax cuts, but his second term was increasingly defined by the mounting costs of the wars and the catastrophic 2008 financial crisis. Bush\u2019s focus on national security and his expansion of executive power left a complex and contentious legacy.",
    "portraitUrl": "President Portraits/bush-walker.jpg"
  },
  {
    "id": "obama",
    "name": "Barack Obama",
    "years": "2009\u20132017",
    "lifespan": "1961\u2013",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 2009,
    "endYear": 2017,
    "events": [
      "Affordable Care Act",
      "Death of Osama bin Laden",
      "Great Recession Recovery"
    ],
    "summary": "Barack Obama, the first African American president, took office in the midst of the Great Recession and oversaw the passage of the Affordable Care Act, the most significant expansion of the American safety net in decades. His administration also navigated the end of the Iraq War and the mission that killed Osama bin Laden. Obama\u2019s focus on climate change, immigration reform, and a more diplomatic approach to foreign policy defined his two terms, though he often faced significant opposition from a divided Congress.",
    "portraitUrl": "President Portraits/obama.jpg"
  },
  {
    "id": "trump",
    "name": "Donald Trump",
    "years": "2017\u20132021 & 2025\u2013",
    "lifespan": "1946\u2013",
    "party": "Republican",
    "partyColor": "red",
    "startYear": 2017,
    "endYear": 2021,
    "events": [
      "Tax Cuts and Jobs Act",
      "COVID-19 Pandemic",
      "Two impeachments"
    ],
    "summary": "Donald Trump\u2019s presidency was marked by a populist 'America First' agenda and a deeply unconventional political style that polarized the nation. His administration focused on tax reform, judicial appointments, and a more transactional approach to foreign policy and trade. Trump\u2019s term was ultimately dominated by his two impeachments, the massive impact of the COVID-19 pandemic, and his unprecedented challenge to the results of the 2020 presidential election.",
    "portraitUrl": "President Portraits/trump.jpg"
  },
  {
    "id": "biden",
    "name": "Joe Biden",
    "years": "2021\u2013",
    "lifespan": "1942\u2013",
    "party": "Democratic",
    "partyColor": "blue",
    "startYear": 2021,
    "endYear": 2025,
    "events": [
      "Infrastructure Investment and Jobs Act",
      "Inflation Reduction Act",
      "Withdrawal from Afghanistan"
    ],
    "summary": "Joe Biden took office with a focus on restoring national unity and addressing the ongoing COVID-19 pandemic and its economic fallout. His administration has overseen major infrastructure and climate legislation, while navigating a complex international landscape defined by the withdrawal from Afghanistan and the Russian invasion of Ukraine. Biden\u2019s presidency continues to focus on strengthening the middle class and reinforcing American alliances abroad.",
    "portraitUrl": "President Portraits/biden.jpg"
  }
];
