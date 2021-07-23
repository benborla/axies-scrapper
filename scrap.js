const fetch = require('node-fetch')
const PROBABILITIES = { d: 0.375, r1: 0.09375, r2: 0.03125 }
const parts = ['eyes', 'mouth', 'ears', 'horn', 'back', 'tail']
const MAX_QUALITY = 6 * (PROBABILITIES.d + PROBABILITIES.r1 + PROBABILITIES.r2)
const colorMap = {
  plant: 'rgb(108, 192, 0)',
  reptile: 'rgb(200, 138, 224)',
  beast: 'rgb(255, 184, 18)',
  aquatic: 'rgb(0, 184, 206)',
  bird: 'rgb(255, 139, 189)',
  bug: 'rgb(255, 83, 65)'
}
const classGeneMap = { '0000': 'beast', '0001': 'bug', '0010': 'bird', '0011': 'plant', '0100': 'aquatic', '0101': 'reptile', 1000: '???', 1001: '???', 1010: '???' }
const typeOrder = { patternColor: 1, eyes: 2, mouth: 3, ears: 4, horn: 5, back: 6, tail: 7 }
const geneColorMap = {
  '0000': { '0010': 'ffec51', '0011': 'ffa12a', '0100': 'f0c66e', '0110': '60afce' },
  '0001': { '0010': 'ff7183', '0011': 'ff6d61', '0100': 'f74e4e' },
  '0010': { '0010': 'ff9ab8', '0011': 'ffb4bb', '0100': 'ff778e' },
  '0011': { '0010': 'ccef5e', '0011': 'efd636', '0100': 'c5ffd9' },
  '0100': { '0010': '4cffdf', '0011': '2de8f2', '0100': '759edb', '0110': 'ff5a71' },
  '0101': { '0010': 'fdbcff', '0011': 'ef93ff', '0100': 'f5e1ff', '0110': '43e27d' },
  // nut hidden_1
  1000: { '0010': 'D9D9D9', '0011': 'D9D9D9', '0100': 'D9D9D9', '0110': 'D9D9D9' },
  // star hidden_2
  1001: { '0010': 'D9D9D9', '0011': 'D9D9D9', '0100': 'D9D9D9', '0110': 'D9D9D9' },
  // moon hidden_3
  1010: { '0010': 'D9D9D9', '0011': 'D9D9D9', '0100': 'D9D9D9', '0110': 'D9D9D9' }
}

const binarytraits = { beast: { eyes: { '001000': { global: 'Puppy' }, '000010': { global: 'Zeal', mystic: 'Calico Zeal' }, '000100': { global: 'Little Peas', xmas: 'Snowflakes' }, '001010': { global: 'Chubby' } }, ears: { '001010': { global: 'Puppy' }, '000100': { global: 'Nut Cracker' }, '000010': { global: 'Nyan', mystic: 'Pointy Nyan' }, '000110': { global: 'Innocent Lamb', xmas: 'Merry Lamb' }, '001000': { global: 'Zen' }, '001100': { global: 'Belieber' } }, back: { '001000': { japan: 'Hamaya', global: 'Risky Beast' }, '000100': { global: 'Hero' }, '000110': { global: 'Jaguar' }, '000010': { mystic: 'Hasagi', global: 'Ronin' }, '001010': { global: 'Timber' }, '001100': { global: 'Furball' } }, horn: { '001000': { japan: 'Umaibo', global: 'Pocky' }, '000100': { global: 'Imp', japan: 'Kendama' }, '000110': { global: 'Merry' }, '000010': { mystic: 'Winter Branch', global: 'Little Branch' }, '001010': { global: 'Dual Blade' }, '001100': { global: 'Arco' } }, tail: { '000100': { global: 'Rice' }, '000010': { global: 'Cottontail', mystic: 'Sakura Cottontail' }, '000110': { global: 'Shiba' }, '001000': { global: 'Hare' }, '001010': { global: 'Nut Cracker' }, '001100': { global: 'Gerbil' } }, mouth: { '000100': { global: 'Goda' }, '000010': { global: 'Nut Cracker', mystic: 'Skull Cracker' }, '001000': { global: 'Axie Kiss' }, '001010': { global: 'Confident' } } }, bug: { mouth: { '001000': { japan: 'Kawaii', global: 'Cute Bunny' }, '000010': { global: 'Mosquito', mystic: 'Feasting Mosquito' }, '000100': { global: 'Pincer' }, '001010': { global: 'Square Teeth' } }, horn: { '001010': { global: 'Parasite' }, '000010': { global: 'Lagging', mystic: 'Laggingggggg' }, '000110': { global: 'Caterpillars' }, '000100': { global: 'Antenna' }, '001000': { global: 'Pliers' }, '001100': { global: 'Leaf Bug' } }, tail: { '001000': { global: 'Gravel Ant' }, '000010': { mystic: 'Fire Ant', global: 'Ant' }, '000100': { global: 'Twin Tail' }, '000110': { global: 'Fish Snack', japan: 'Maki' }, '001010': { global: 'Pupae' }, '001100': { global: 'Thorny Caterpillar' } }, back: { '001000': { global: 'Sandal' }, '000010': { global: 'Snail Shell', mystic: 'Starry Shell' }, '000100': { global: 'Garish Worm', xmas: 'Candy Canes' }, '000110': { global: 'Buzz Buzz' }, '001010': { global: 'Scarab' }, '001100': { global: 'Spiky Wing' } }, ears: { '000010': { global: 'Larva', mystic: 'Vector' }, '000110': { global: 'Ear Breathing' }, '000100': { global: 'Beetle Spike' }, '001000': { global: 'Leaf Bug' }, '001010': { global: 'Tassels' }, '001100': { japan: 'Mon', global: 'Earwing' } }, eyes: { '000010': { global: 'Bookworm', mystic: 'Broken Bookworm' }, '000100': { global: 'Neo' }, '001010': { global: 'Kotaro?' }, '001000': { global: 'Nerdy' } } }, aquatic: { eyes: { '001000': { global: 'Gero' }, '000010': { global: 'Sleepless', mystic: 'Insomnia', japan: 'Yen' }, '000100': { global: 'Clear' }, '001010': { global: 'Telescope' } }, mouth: { '001000': { global: 'Risky Fish' }, '000100': { global: 'Catfish' }, '000010': { global: 'Lam', mystic: 'Lam Handsome' }, '001010': { global: 'Piranha', japan: 'Geisha' } }, horn: { '001100': { global: 'Shoal Star' }, '000110': { global: 'Clamshell' }, '000010': { global: 'Babylonia', mystic: 'Candy Babylonia' }, '000100': { global: 'Teal Shell' }, '001000': { global: 'Anemone' }, '001010': { global: 'Oranda' } }, ears: { '000010': { global: 'Nimo', mystic: 'Red Nimo' }, '000110': { global: 'Bubblemaker' }, '000100': { global: 'Tiny Fan' }, '001000': { global: 'Inkling' }, '001010': { global: 'Gill' }, '001100': { global: 'Seaslug' } }, tail: { '000010': { global: 'Koi', mystic: 'Kuro Koi', japan: 'Koinobori' }, '000110': { global: 'Tadpole' }, '000100': { global: 'Nimo' }, '001010': { global: 'Navaga' }, '001000': { global: 'Ranchu' }, '001100': { global: 'Shrimp' } }, back: { '000010': { global: 'Hermit', mystic: 'Crystal Hermit' }, '000100': { global: 'Blue Moon' }, '000110': { global: 'Goldfish' }, '001010': { global: 'Anemone' }, '001000': { global: 'Sponge' }, '001100': { global: 'Perch' } } }, bird: { ears: { '001100': { japan: 'Karimata', global: 'Risky Bird' }, '000010': { global: 'Pink Cheek', mystic: 'Heart Cheek' }, '000100': { global: 'Early Bird' }, '000110': { global: 'Owl' }, '001010': { global: 'Curly' }, '001000': { global: 'Peace Maker' } }, tail: { '001010': { japan: 'Omatsuri', global: "Granma's Fan" }, '000010': { global: 'Swallow', mystic: 'Snowy Swallow' }, '000100': { global: 'Feather Fan' }, '000110': { global: 'The Last One' }, '001000': { global: 'Cloud' }, '001100': { global: 'Post Fight' } }, back: { '000010': { global: 'Balloon', mystic: 'Starry Balloon' }, '000110': { global: 'Raven' }, '000100': { global: 'Cupid', japan: 'Origami' }, '001000': { global: 'Pigeon Post' }, '001010': { global: 'Kingfisher' }, '001100': { global: 'Tri Feather' } }, horn: { '000110': { global: 'Trump' }, '000010': { global: 'Eggshell', mystic: 'Golden Shell' }, '000100': { global: 'Cuckoo' }, '001000': { global: 'Kestrel' }, '001010': { global: 'Wing Horn' }, '001100': { global: 'Feather Spear', xmas: 'Spruce Spear' } }, mouth: { '000010': { global: 'Doubletalk', mystic: 'Mr. Doubletalk' }, '000100': { global: 'Peace Maker' }, '001000': { global: 'Hungry Bird' }, '001010': { global: 'Little Owl' } }, eyes: { '000010': { global: 'Mavis', mystic: 'Sky Mavis' }, '000100': { global: 'Lucas' }, '001010': { global: 'Robin' }, '001000': { global: 'Little Owl' } } }, reptile: { eyes: { '001010': { japan: 'Kabuki', global: 'Topaz' }, '000100': { global: 'Tricky' }, '000010': { global: 'Gecko', mystic: 'Crimson Gecko' }, '001000': { global: 'Scar', japan: 'Dokuganryu' } }, mouth: { '001000': { global: 'Razor Bite' }, '000100': { global: 'Kotaro' }, '000010': { global: 'Toothless Bite', mystic: 'Venom Bite' }, '001010': { global: 'Tiny Turtle', japan: 'Dango' } }, ears: { '001000': { global: 'Small Frill' }, '000110': { global: 'Curved Spine' }, '000100': { global: 'Friezard' }, '000010': { global: 'Pogona', mystic: 'Deadly Pogona' }, '001010': { global: 'Swirl' }, '001100': { global: 'Sidebarb' } }, back: { '001000': { global: 'Indian Star' }, '000010': { global: 'Bone Sail', mystic: 'Rugged Sail' }, '000100': { global: 'Tri Spikes' }, '000110': { global: 'Green Thorns' }, '001010': { global: 'Red Ear' }, '001100': { global: 'Croc' } }, tail: { '000100': { global: 'Iguana' }, '000010': { global: 'Wall Gecko', mystic: 'Escaped Gecko' }, '000110': { global: 'Tiny Dino' }, '001000': { global: 'Snake Jar', xmas: 'December Surprise' }, '001010': { global: 'Gila' }, '001100': { global: 'Grass Snake' } }, horn: { '000010': { global: 'Unko', mystic: 'Pinku Unko' }, '000110': { global: 'Cerastes' }, '000100': { global: 'Scaly Spear' }, '001010': { global: 'Incisor' }, '001000': { global: 'Scaly Spoon' }, '001100': { global: 'Bumpy' } } }, plant: { tail: { '001000': { global: 'Yam' }, '000010': { global: 'Carrot', mystic: 'Namek Carrot' }, '000100': { global: 'Cattail' }, '000110': { global: 'Hatsune' }, '001010': { global: 'Potato Leaf' }, '001100': { global: 'Hot Butt' } }, mouth: { '000100': { global: 'Zigzag', xmas: 'Rudolph' }, '000010': { global: 'Serious', mystic: 'Humorless' }, '001000': { global: 'Herbivore' }, '001010': { global: 'Silence Whisper' } }, eyes: { '000010': { global: 'Papi', mystic: 'Dreamy Papi' }, '000100': { global: 'Confused' }, '001010': { global: 'Blossom' }, '001000': { global: 'Cucumber Slice' } }, ears: { '000010': { global: 'Leafy', mystic: 'The Last Leaf' }, '000110': { global: 'Rosa' }, '000100': { global: 'Clover' }, '001000': { global: 'Sakura', japan: 'Maiko' }, '001010': { global: 'Hollow' }, '001100': { global: 'Lotus' } }, back: { '000110': { global: 'Bidens' }, '000100': { global: 'Shiitake', japan: 'Yakitori' }, '000010': { global: 'Turnip', mystic: 'Pink Turnip' }, '001010': { global: 'Mint' }, '001000': { global: 'Watering Can' }, '001100': { global: 'Pumpkin' } }, horn: { '000100': { global: 'Beech', japan: 'Yorishiro' }, '000110': { global: 'Rose Bud' }, '000010': { global: 'Bamboo Shoot', mystic: 'Golden Bamboo Shoot' }, '001010': { global: 'Cactus' }, '001000': { global: 'Strawberry Shortcake' }, '001100': { global: 'Watermelon' } } } }

const headers = new fetch.Headers()
const data = null
const lookup = process.argv.slice(2)[0]
const start = process.argv.slice(2)[2] || 0
const filterByPurity = process.argv.slice(2)[1] || 0
let bodyPartsMap = {}

function graphql (payload, action) {
  const url = 'https://axieinfinity.com/graphql-server-v2/graphql'
  fetch(url, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }).then(function (response) {
    return response.json()
  }).then(function (response) {
    action(response)
  }).catch(function (error) {
    console.log(error)
  })
}

function getEggs () {
  return graphql(
    {
      operationName: 'GetAxieBriefList',
      variables: {
        from: parseInt(start),
        size: 2355,
        sort: 'PriceAsc',
        auctionType: 'Sale',
        owner: null,
        criteria: {
          region: null,
          parts: null,
          bodyShapes: null,
          classes: null,
          stages: [
            1
          ],
          numMystic: null,
          pureness: null,
          title: null,
          breedable: null,
          breedCount: null,
          hp: [],
          skill: [],
          speed: [],
          morale: []
        }
      },
      query: 'query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n  sireId sireClass matronId matronClass name\n  stage\n  class\n  breedCount\n  image\n  title\n  battleInfo {\n    banned\n    __typename\n  }\n  auction {\n    currentPrice\n    currentPriceUSD\n    __typename\n  }\n  parts {\n    id\n    name\n    class\n    type\n    specialGenes\n    __typename\n  }\n  __typename\n}\n'
    }
    , function (response) {
      const eggs = [response.data.axies.results]
      const filtered = eggs.flat().filter(egg => egg.sireClass === lookup && egg.matronClass === lookup)

      console.log(`Found ${filtered.length} of ${lookup} class.`)
      console.log('Analyzing parents...')

      filtered.forEach(egg => {
        analyzeEgg(egg)
      })
    })
}

function analyzeEgg (egg) {
  const fatherId = parseInt(egg.sireId)
  const motherId = parseInt(egg.matronId)
  let motherPureness = 0
  let fatherPureness = 0

  const father = graphql(
    {
      operationName: 'GetAxieDetail',
      variables: {
        axieId: fatherId
      },
      query: 'query GetAxieDetail($axieId: ID!) {\n  axie(axieId: $axieId) {\n    ...AxieDetail\n    __typename\n  }\n}\n\nfragment AxieDetail on Axie {\n  id\n  image\n  class\n  chain\n  name\n  genes\n  owner\n  birthDate\n  bodyShape\n  class\n  sireId\n  sireClass\n  matronId\n  matronClass\n  stage\n  title\n  breedCount\n  level\n  \n  parts {\n    ...AxiePart\n    __typename\n  }\n  stats {\n    ...AxieStats\n    __typename\n  }\n}\n\nfragment AxiePart on AxiePart {\n  id\n  name\n  class\n  type\n  specialGenes\n  stage\n  abilities {\n    ...AxieCardAbility\n    __typename\n  }\n  __typename\n}\n\nfragment AxieCardAbility on AxieCardAbility {\n  id\n  name\n  attack\n  defense\n  energy\n  description\n  backgroundUrl\n  effectIconUrl\n  __typename\n}\n\nfragment AxieStats on AxieStats {\n  hp\n  speed\n  skill\n  morale\n  __typename\n}\n'
    }, function (response) {
      const details = response.data.axie

      const genes = genesToBin(BigInt(details.genes))
      const traits = getTraits(genes)

      const qp = getQualityAndPureness(traits, details.class.toLowerCase())
      fatherPureness = Math.round(qp.quality * 100)

      // console.log(`Erpat of egg ${egg.name}`);
      // console.log({
      // id: details.id,
      // name: details.name,
      // class: details.class,
      // pureness: fatherPureness + '%',
      // url: 'https://marketplace.axieinfinity.com/axie/' + details.id
      // });

      const mother = graphql(
        {
          operationName: 'GetAxieDetail',
          variables: {
            axieId: motherId
          },
          query: 'query GetAxieDetail($axieId: ID!) {\n  axie(axieId: $axieId) {\n    ...AxieDetail\n    __typename\n  }\n}\n\nfragment AxieDetail on Axie {\n  id\n  image\n  class\n  chain\n  name\n  genes\n  owner\n  birthDate\n  bodyShape\n  class\n  sireId\n  sireClass\n  matronId\n  matronClass\n  stage\n  title\n  breedCount\n  level\n  \n  parts {\n    ...AxiePart\n    __typename\n  }\n  stats {\n    ...AxieStats\n    __typename\n  }\n}\n\nfragment AxiePart on AxiePart {\n  id\n  name\n  class\n  type\n  specialGenes\n  stage\n  abilities {\n    ...AxieCardAbility\n    __typename\n  }\n  __typename\n}\n\nfragment AxieCardAbility on AxieCardAbility {\n  id\n  name\n  attack\n  defense\n  energy\n  description\n  backgroundUrl\n  effectIconUrl\n  __typename\n}\n\nfragment AxieStats on AxieStats {\n  hp\n  speed\n  skill\n  morale\n  __typename\n}\n'
        }, function (response) {
          const details = response.data.axie

          const genes = genesToBin(BigInt(details.genes))
          const traits = getTraits(genes)

          const qpMom = getQualityAndPureness(traits, details.class.toLowerCase())
          motherPureness = Math.round(qpMom.quality * 100)

          // console.log(`Mudra of egg ${egg.name}`);
          // console.log({
          // id: details.id,
          // name: details.name,
          // class: details.class,
          // pureness: motherPureness + '%',
          // url: 'https://marketplace.axieinfinity.com/axie/' + details.id
          // });

          const breedPureness = Math.round((fatherPureness + motherPureness) / 2)

          if (breedPureness >= filterByPurity && breedPureness <= filterByPurity) {
            console.log('____________________________________________________________')
            console.log(`Egg ${egg.name} info`)
            console.info({
              id: egg.id,
              name: egg.name,
              price: egg.auction.currentPrice,
              url: 'https://marketplace.axieinfinity.com/axie/' + egg.id
            })
            console.info('Estimated Breed Pureness: ' + breedPureness + '%')
            console.log('____________________________________________________________')
          }
        })
    })
}

function getQualityAndPureness (traits, cls) {
  let quality = 0
  let dPureness = 0
  for (const i in parts) {
    const d = traits[parts[i]].d.flat()
    const r1 = traits[parts[i]].r1.flat()
    const r2 = traits[parts[i]].r2.flat()

    d.forEach(dp => {
      if (dp.class == cls) {
        quality += PROBABILITIES.d
        dPureness++
      }
    })

    r1.forEach(pr1 => {
      if (pr1.class == cls) {
        quality += PROBABILITIES.r1
      }
    })

    r2.forEach(pr2 => {
      if (pr2.class == cls) {
        quality += PROBABILITIES.r2
      }
    })
  }
  return { quality: quality / MAX_QUALITY, pureness: dPureness }
}

function getTraits (genes) {
  const groups = [genes.slice(0, 32), genes.slice(32, 64), genes.slice(64, 96), genes.slice(96, 128), genes.slice(128, 160), genes.slice(160, 192), genes.slice(192, 224), genes.slice(224, 256)]
  const cls = getClassFromGroup(groups[0])
  const region = getRegionFromGroup(groups[0])
  const pattern = getPatternsFromGroup(groups[1])
  const color = getColorsFromGroup(groups[1], groups[0].slice(0, 4))
  const eyes = getPartsFromGroup('eyes', groups[2], region)
  const mouth = getPartsFromGroup('mouth', groups[3], region)
  const ears = getPartsFromGroup('ears', groups[4], region)
  const horn = getPartsFromGroup('horn', groups[5], region)
  const back = getPartsFromGroup('back', groups[6], region)
  const tail = getPartsFromGroup('tail', groups[7], region)
  return { cls: cls, region: region, pattern: pattern, color: color, eyes: eyes, mouth: mouth, ears: ears, horn: horn, back: back, tail: tail }
}

function strMul (str, num) {
  let s = ''
  for (let i = 0; i < num; i++) {
    s += str
  }
  return s
}

function genesToBin (genes) {
  let genesString = genes.toString(2)
  genesString = strMul('0', 256 - genesString.length) + genesString
  return genesString
}

function getClassFromGroup (group) {
  const bin = group.slice(0, 4)
  if (!(bin in classGeneMap)) {
    return 'Unknown Class'
  }
  return classGeneMap[bin]
}

function getPatternsFromGroup (group) {
  // patterns could be 6 bits. use 4 for now
  return { d: group.slice(2, 8), r1: group.slice(8, 14), r2: group.slice(14, 20) }
}

const regionGeneMap = { '00000': 'global', '00001': 'japan' }
function getRegionFromGroup (group) {
  const regionBin = group.slice(8, 13)
  if (regionBin in regionGeneMap) {
    return regionGeneMap[regionBin]
  }
  return 'Unknown Region'
}

function getColor (bin, cls) {
  let color
  if (bin == '0000') {
    color = 'ffffff'
  } else if (bin == '0001') {
    color = '7a6767'
  } else {
    color = geneColorMap[cls][bin]
  }
  return color
}

function getColorsFromGroup (group, cls) {
  return { d: getColor(group.slice(20, 24), cls), r1: getColor(group.slice(24, 28), cls), r2: getColor(group.slice(28, 32), cls) }
}

function getPartsFromGroup (part, group, region) {
  const skinBinary = group.slice(0, 2)
  const mystic = skinBinary == '11'
  const dClass = classGeneMap[group.slice(2, 6)]
  const dBin = group.slice(6, 12)
  const dName = getPartName(dClass, part, region, dBin, skinBinary)

  const r1Class = classGeneMap[group.slice(12, 16)]
  const r1Bin = group.slice(16, 22)
  const r1Name = getPartName(r1Class, part, region, r1Bin)

  const r2Class = classGeneMap[group.slice(22, 26)]
  const r2Bin = group.slice(26, 32)
  const r2Name = getPartName(r2Class, part, region, r2Bin)

  return { d: getPartFromName(part, dName), r1: getPartFromName(part, r1Name), r2: getPartFromName(part, r2Name), mystic: mystic }
}

const partsClassMap = {}
function getPartName (cls, part, region, binary, skinBinary = '00') {
  let trait

  if (binary in binarytraits[cls][part]) {
    if (skinBinary == '11') {
      trait = binarytraits[cls][part][binary].mystic
    } else if (skinBinary == '10') {
      trait = binarytraits[cls][part][binary].xmas
    } else if (region in binarytraits[cls][part][binary]) {
      // trait = binarytraits[cls][part][binary][region];
      trait = binarytraits[cls][part][binary][region]
    } else if ('global' in binarytraits[cls][part][binary]) {
      trait = binarytraits[binary].global

      console.log('went here')
    } else {
      trait = 'UNKNOWN Regional ' + cls + ' ' + part
    }
  } else {
    trait = 'UNKNOWN ' + cls + ' ' + part
  }
  // return part + "-" + trait.toLowerCase().replace(/\s/g, "-");
  partsClassMap[trait + ' ' + part] = cls
  return trait
}

function getPartFromName (traitType, partName) {
  const traitId = traitType.toLowerCase() + '-' + partName.toLowerCase().replace(/\s/g, '-').replace(/[\?'\.]/g, '')
  const parts = [bodyPartsMap]
  const filtered = parts.flat().filter(egg => egg.partId === traitId)

  return filtered
}

function checkStatus (res) {
  if (res.ok) {
    return res
  } else {
    throw Exception('Failed to get axie details: ' + res)
  }
}

function getBodyParts () {
  bodyPartsMap = require('./bodyparts.json')
}

getBodyParts()
getEggs()
