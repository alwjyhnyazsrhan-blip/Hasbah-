import { translations, Language } from './translations';

export interface DeceasedData {
  name: string;
  gender: 'male' | 'female';
  religion: 'muslim' | 'nonMuslim';
  totalAmount: number;
  area: number;
}

export interface HeirDetail {
  id: string;
  type: string;
  religion: 'muslim' | 'nonMuslim';
  name?: string;
  parentName?: string;
}

export interface InheritanceResult {
  heirId: string;
  heir: string;
  heirName?: string;
  heirType: string;
  percentage: number;
  note: string;
  isBlocked: boolean;
  blockedBy?: string;
  blockedByReligion?: boolean;
  blockedByParentsDual?: boolean;
}

// Helper to get gender from heir type
const getGender = (type: string): 'male' | 'female' => {
  const maleTypes = [
    'husband', 'father', 'son', 'brother', 'brotherMaternal', 'brotherPaternal',
    'grandfatherPaternal', 'grandfatherMaternal',
    'sonOfSon', 'sonOfDaughter',
    'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
    'unclePaternal', 'uncleMaternal', 'uncleMaternalMaternal', 'uncleMaternalPaternal',
    'unclePaternalPaternal', 'unclePaternalMaternal',
    'unclePaternalSon', 'unclePaternalSonPaternal', 'unclePaternalSonMaternal',
    'auntPaternalSon', 'auntPaternalSonMaternal', 'auntPaternalPhPaternal', // Note: original maleTypes list has variations
    'uncleMaternalSon', 'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal',
    'auntMaternalSon', 'auntMaternalSonMaternal', 'auntMaternalSonPaternal'
  ];
  return maleTypes.includes(type) ? 'male' : 'female';
};

// Heir type classification
const childrenTypes = ['son', 'daughter'];
const grandchildrenTypes = ['sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter'];
const parentTypes = ['father', 'mother'];
const grandparentTypes = ['grandfatherPaternal', 'grandfatherMaternal', 'grandmotherPaternal', 'grandmotherMaternal'];
const grandmotherTypes = ['grandmotherPaternal', 'grandmotherMaternal'];
const grandfatherTypes = ['grandfatherPaternal', 'grandfatherMaternal'];
const fullSiblingTypes = ['brother', 'sister'];
const paternalSiblingTypes = ['brotherPaternal', 'sisterPaternal'];
const maternalSiblingTypes = ['brotherMaternal', 'sisterMaternal'];
const siblingTypes = [...fullSiblingTypes, ...paternalSiblingTypes, ...maternalSiblingTypes];
const nephewNieceTypes = [
  'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
  'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'
];
const fullNephewNieceTypes = ['brotherSon', 'sisterSon', 'brotherDaughter', 'sisterDaughter'];
const paternalNephewNieceTypes = ['brotherSonPaternal', 'sisterSonPaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'];
const uncleAuntTypes = [
  'unclePaternal', 'auntPaternal', 'uncleMaternal', 'auntMaternal',
  'uncleMaternalMaternal', 'uncleMaternalPaternal', 'auntMaternalMaternal', 'auntMaternalPaternal',
  'unclePaternalPaternal', 'unclePaternalMaternal', 'auntPaternalPaternal', 'auntPaternalMaternal'
];
// Uncles/aunts from father's side
const paternalSideUncleAuntTypes = [
  'unclePaternal', 'auntPaternal',
  'unclePaternalPaternal', 'auntPaternalPaternal',
  'unclePaternalMaternal', 'auntPaternalMaternal'
];
// Uncles/aunts from mother's side
const maternalSideUncleAuntTypes = [
  'uncleMaternal', 'auntMaternal',
  'uncleMaternalMaternal', 'auntMaternalMaternal',
  'uncleMaternalPaternal', 'auntMaternalPaternal'
];
const cousinTypes = [
  'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
  'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
  'auntPaternalSonMaternal', 'auntPaternalSonPaternal', 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal',
  'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
  'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
  'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
];

// Class 2: Grandparents + Siblings + Nephews/Nieces
const class2Types = [...grandparentTypes, ...siblingTypes, ...nephewNieceTypes];
// Class 3: Uncles/Aunts + Cousins
const class3Types = [...uncleAuntTypes, ...cousinTypes];

// Get Arabic ordinal for numbering
const getArabicOrdinal = (n: number, isFemale: boolean, language: Language): string => {
  if (language === 'ar') {
    const maleOrdinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];
    const femaleOrdinals = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'];
    const ordinals = isFemale ? femaleOrdinals : maleOrdinals;
    return ordinals[n - 1] || `${n}`;
  }
  return `${n}`;
};

// Get singular name for display
const getSingularName = (type: string, language: Language): string => {
  const t = translations[language];
  const key = type as keyof typeof t;
  return (t[key] as string) || type;
};

// Determine blocking rules
function getBlockingInfo(
  heirType: string,
  allMuslimHeirs: { type: string; count: number }[],
  _deceased: DeceasedData
): { isBlocked: boolean; blockedBy?: string; blockedByParentsDual?: boolean } {
  const hasHeir = (types: string[]): string | null => {
    for (const t of types) {
      const found = allMuslimHeirs.find(h => h.type === t && h.count > 0);
      if (found) return t;
    }
    return null;
  };

  const hasAnyHeir = (types: string[]): boolean => hasHeir(types) !== null;

  const muslimGrandmotherCount = allMuslimHeirs
    .filter(h => grandmotherTypes.includes(h.type))
    .reduce((sum, h) => sum + h.count, 0);

  const isGrandmother = grandmotherTypes.includes(heirType);
  const hasMother = hasAnyHeir(['mother']);
  const hasFather = hasAnyHeir(['father']);
  const bothParentsPresent = hasMother && hasFather;

  // RULE 1: Son blocks EVERYONE except daughter, father, mother, grandmother, spouse
  if (hasAnyHeir(['son'])) {
    const allowedWithSon = [
      'son', 'daughter',
      'father', 'mother',
      'grandmotherPaternal', 'grandmotherMaternal',
      'wife', 'husband'
    ];
    if (!allowedWithSon.includes(heirType)) {
      return { isBlocked: true, blockedBy: 'son' };
    }
  }

  // RULE 1b: Daughter (no son) blocks EVERYONE except father, mother, grandmother, spouse
  if (hasAnyHeir(['daughter']) && !hasAnyHeir(['son'])) {
    const allowedWithDaughter = [
      'son', 'daughter',
      'father', 'mother',
      'grandmotherPaternal', 'grandmotherMaternal',
      'wife', 'husband'
    ];
    if (!allowedWithDaughter.includes(heirType)) {
      return { isBlocked: true, blockedBy: 'daughter' };
    }
  }

  // RULE 2 & 3: Father + Mother block multiple grandmothers
  if (isGrandmother && muslimGrandmotherCount > 1 && bothParentsPresent) {
    return { isBlocked: true, blockedBy: 'father', blockedByParentsDual: true };
  }

  // RULE 3: Father blocks grandfathers
  if (grandfatherTypes.includes(heirType)) {
    const blocker = hasHeir(['father']);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  // RULE 4: Children block grandchildren
  if (grandchildrenTypes.includes(heirType)) {
    if (heirType === 'sonOfSon' || heirType === 'daughterOfSon') {
      const blocker = hasHeir(['son']);
      if (blocker) return { isBlocked: true, blockedBy: blocker };
    }
    if (heirType === 'sonOfDaughter' || heirType === 'daughterOfDaughter') {
      const blocker = hasHeir(['daughter']);
      if (blocker) return { isBlocked: true, blockedBy: blocker };
      const blocker2 = hasHeir(['son']);
      if (blocker2) return { isBlocked: true, blockedBy: blocker2 };
    }
  }

  // RULE 5: Class-based blocking
  // Class 1 blocks Class 2 and 3
  const isGrandfather = grandfatherTypes.includes(heirType);
  
  if (class2Types.includes(heirType) || class3Types.includes(heirType)) {
    const hasChildren = hasAnyHeir(childrenTypes);
    const hasParents = hasAnyHeir(parentTypes);
    const hasActiveGrandchildren = allMuslimHeirs.some(h =>
      grandchildrenTypes.includes(h.type) && h.count > 0 &&
      !getBlockingInfo(h.type, allMuslimHeirs.filter(x => x.type !== h.type && !grandchildrenTypes.includes(x.type)), _deceased).isBlocked
    );

    if (isGrandfather) {
      if (hasChildren) {
        const blocker = hasHeir(childrenTypes);
        if (blocker) return { isBlocked: true, blockedBy: blocker };
      }
      if (hasParents) {
        const blocker = hasHeir(parentTypes);
        if (blocker) return { isBlocked: true, blockedBy: blocker };
      }
      if (hasActiveGrandchildren) {
        const blocker = hasHeir(grandchildrenTypes);
        if (blocker) return { isBlocked: true, blockedBy: blocker };
      }
    } else {
      if (isGrandmother) {
        if ((bothParentsPresent && muslimGrandmotherCount > 1) || hasActiveGrandchildren) {
          if (bothParentsPresent && muslimGrandmotherCount > 1) {
            return { isBlocked: true, blockedBy: 'father', blockedByParentsDual: true };
          }
          if (hasActiveGrandchildren) {
            const blocker = hasHeir(grandchildrenTypes);
            if (blocker) return { isBlocked: true, blockedBy: blocker };
          }
        }
      } else if (hasChildren || hasParents || hasActiveGrandchildren) {
        if (hasChildren) {
          const blocker = hasHeir(childrenTypes);
          if (blocker) return { isBlocked: true, blockedBy: blocker };
        }
        if (hasParents) {
          const blocker = hasHeir(parentTypes);
          if (blocker) return { isBlocked: true, blockedBy: blocker };
        }
        if (hasActiveGrandchildren) {
          const blocker = hasHeir(grandchildrenTypes);
          if (blocker) return { isBlocked: true, blockedBy: blocker };
        }
      }
    }
  }

  // RULE 6: Class 2 blocks Class 3
  if (class3Types.includes(heirType)) {
    const grandfatherTypesLocal = ['grandfatherPaternal', 'grandfatherMaternal'];
    const class2BlockingTypes = [...siblingTypes, ...nephewNieceTypes, ...grandfatherTypesLocal];
    const hasClass2Blocker = allMuslimHeirs.some(h =>
      class2BlockingTypes.includes(h.type) && h.count > 0
    );
    if (hasClass2Blocker) {
      const blocker = hasHeir(class2BlockingTypes);
      if (blocker) return { isBlocked: true, blockedBy: blocker };
    }
  }

  // RULE 7: Within Class 2 - Siblings and Grandparents block nephews/nieces
  // Note: Grandparents do NOT block nephews/nieces as they inherit together (grandparent acts like a sibling), EXCEPT paternal grandfather (الجد لأب) who blocks them because he acts like a brother.
  if (nephewNieceTypes.includes(heirType)) {
    const blocker = hasHeir([...siblingTypes, 'grandfatherPaternal']);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  // RULE 8: Within Class 3 - Uncles/Aunts block cousins
  if (cousinTypes.includes(heirType)) {
    const blocker = hasHeir(uncleAuntTypes);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  // RULE 9: Full siblings block paternal siblings
  if (paternalSiblingTypes.includes(heirType)) {
    const hasFull = hasAnyHeir(fullSiblingTypes);
    if (hasFull) {
      const blocker = hasHeir(fullSiblingTypes);
      if (blocker) return { isBlocked: true, blockedBy: blocker };
    }
  }

  // RULE 10: Full siblings' children block paternal siblings' children
  if (paternalNephewNieceTypes.includes(heirType)) {
    const hasFullNephews = hasAnyHeir(fullNephewNieceTypes);
    if (hasFullNephews) {
      const blocker = hasHeir(fullNephewNieceTypes);
      if (blocker) return { isBlocked: true, blockedBy: blocker };
    }
  }

  // RULE 11: Full Uncle/Aunt blocks Paternal Uncle/Aunt
  if (heirType === 'unclePaternalPaternal') {
    const blocker = hasHeir(['unclePaternal']);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }
  if (heirType === 'auntPaternalPaternal') {
    const blocker = hasHeir(['auntPaternal']);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  // RULE 12: Full Maternal Uncle/Aunt blocks Paternal Maternal Uncle/Aunt
  if (heirType === 'uncleMaternalPaternal') {
    const blocker = hasHeir(['uncleMaternal']);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }
  if (heirType === 'auntMaternalPaternal') {
    const blocker = hasHeir(['auntMaternal']);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  // Cousin blocking: Full blocks Paternal
  const fullPaternalCousinTypes = ['unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter'];
  const paternalPaternalCousinTypes = ['unclePaternalSonPaternal', 'unclePaternalDaughterPaternal', 'auntPaternalSonPaternal', 'auntPaternalDaughterPaternal'];
  
  if (paternalPaternalCousinTypes.includes(heirType)) {
    const blocker = hasHeir(fullPaternalCousinTypes);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  const fullMaternalCousinTypes = ['uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter'];
  const paternalMaternalCousinTypes = ['uncleMaternalSonPaternal', 'uncleMaternalDaughterPaternal', 'auntMaternalSonPaternal', 'auntMaternalDaughterPaternal'];

  if (paternalMaternalCousinTypes.includes(heirType)) {
    const blocker = hasHeir(fullMaternalCousinTypes);
    if (blocker) return { isBlocked: true, blockedBy: blocker };
  }

  return { isBlocked: false };
}

export function calculateInheritance(
  deceased: DeceasedData,
  heirDetails: HeirDetail[],
  language: Language
): { results: InheritanceResult[], isKalala: boolean } {
  const t = (key: keyof typeof translations.ar) => translations[language][key] as string;
  const results: InheritanceResult[] = [];

  if (heirDetails.length === 0) return { results, isKalala: false };

  const heirCounts: Record<string, number> = {};
  const allHeirCounts: Record<string, number> = {};

  heirDetails.forEach(h => {
    allHeirCounts[h.type] = (allHeirCounts[h.type] || 0) + 1;
    if (h.religion === 'muslim') {
      heirCounts[h.type] = (heirCounts[h.type] || 0) + 1;
    }
  });

  const muslimHeirsForBlocking = Object.entries(heirCounts).map(([type, count]) => ({ type, count }));

  const blockingResults: Record<string, { isBlocked: boolean; blockedBy?: string; blockedByReligion?: boolean; blockedByParentsDual?: boolean }> = {};

  heirDetails.forEach(heir => {
    if (heir.religion === 'nonMuslim') {
      blockingResults[heir.id] = { isBlocked: true, blockedByReligion: true };
    } else {
      const blocking = getBlockingInfo(heir.type, muslimHeirsForBlocking, deceased);
      blockingResults[heir.id] = { 
        isBlocked: blocking.isBlocked, 
        blockedBy: blocking.blockedBy, 
        blockedByReligion: false,
        blockedByParentsDual: blocking.blockedByParentsDual
      };
    }
  });

  const activeHeirCounts: Record<string, number> = {};
  heirDetails.forEach(heir => {
    if (!blockingResults[heir.id]?.isBlocked) {
      activeHeirCounts[heir.type] = (activeHeirCounts[heir.type] || 0) + 1;
    }
  });

  const hasActiveSons = (activeHeirCounts['son'] || 0) > 0;
  const hasActiveDaughters = (activeHeirCounts['daughter'] || 0) > 0;
  const hasActiveChildren = hasActiveSons || hasActiveDaughters;

  const hasActiveSonOfSon = (activeHeirCounts['sonOfSon'] || 0) > 0;
  const hasActiveDaughterOfSon = (activeHeirCounts['daughterOfSon'] || 0) > 0;
  const hasActiveSonOfDaughter = (activeHeirCounts['sonOfDaughter'] || 0) > 0;
  const hasActiveDaughterOfDaughter = (activeHeirCounts['daughterOfDaughter'] || 0) > 0;
  const hasActiveGrandchildren = hasActiveSonOfSon || hasActiveDaughterOfSon || hasActiveSonOfDaughter || hasActiveDaughterOfDaughter;

  const hasActiveDescendants = hasActiveChildren || hasActiveGrandchildren;

  const hasActiveFather = (activeHeirCounts['father'] || 0) > 0;
  const hasActiveMother = (activeHeirCounts['mother'] || 0) > 0;

  const hasActiveNephewsNieces = nephewNieceTypes.some(nt => (activeHeirCounts[nt] || 0) > 0);
  const hasActiveUnclesAunts = uncleAuntTypes.some(ut => (activeHeirCounts[ut] || 0) > 0);
  const hasActiveSiblings = siblingTypes.some(st => (activeHeirCounts[st] || 0) > 0);

  const isKalala = !hasActiveFather && !hasActiveMother && !hasActiveDescendants && (hasActiveSiblings || hasActiveNephewsNieces);
  const unclesAreMainHeirs = hasActiveUnclesAunts && !hasActiveFather && !hasActiveMother && !hasActiveDescendants && !hasActiveSiblings;

  const hasActiveGrandfathers = grandfatherTypes.some(gt => (activeHeirCounts[gt] || 0) > 0);
  const hasActiveGrandmothersAny = grandmotherTypes.some(gt => (activeHeirCounts[gt] || 0) > 0);
  const hasActiveGrandparents = hasActiveGrandfathers || hasActiveGrandmothersAny;
  const grandparentsAreMainHeirs = hasActiveGrandparents && !hasActiveFather && !hasActiveMother && !hasActiveDescendants && !hasActiveSiblings && !hasActiveUnclesAunts;

  const allMuslimBrothers = ['brother', 'brotherPaternal'].reduce((sum, st) => sum + (heirCounts[st] || 0), 0);
  const allMuslimSisters = ['sister', 'sisterPaternal'].reduce((sum, st) => sum + (heirCounts[st] || 0), 0);

  const motherReducedBySiblings = 
    allMuslimBrothers >= 2 ||
    (allMuslimBrothers >= 1 && allMuslimSisters >= 2) ||
    allMuslimSisters >= 4;

  const getMotherSiblingNote = (): string => {
    if (allMuslimBrothers >= 2) return t('noteMotherSixthTwoBrothers');
    if (allMuslimBrothers >= 1 && allMuslimSisters >= 2) return t('noteMotherSixthBrotherSisters');
    return t('noteMotherSixthFourSisters');
  };

  const hasActiveMaternalGC = (activeHeirCounts['sonOfDaughter'] || 0) > 0 || (activeHeirCounts['daughterOfDaughter'] || 0) > 0;
  const hasActivePaternalGC = (activeHeirCounts['sonOfSon'] || 0) > 0 || (activeHeirCounts['daughterOfSon'] || 0) > 0;
  
  const isDaughterOnlyPath = (hasActiveDaughters || hasActiveMaternalGC) && !hasActiveSons && !hasActivePaternalGC;

  const shareMap: Record<string, { percentage: number; note: string }> = {};
  const spouseTypes = ['wife', 'husband'];

  const activeSpouses = heirDetails.filter(h =>
    spouseTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
  );

  let spouseShareTotal = 0;

  if (activeSpouses.length > 0) {
    const isHusband = activeSpouses[0].type === 'husband';
    const isGrandchildrenOnly = hasActiveGrandchildren && !hasActiveChildren;
    if (isHusband) {
      spouseShareTotal = hasActiveDescendants ? (100 / 4) : (100 / 2);
      let note = hasActiveDescendants 
        ? (isGrandchildrenOnly ? t('noteHusbandQuarterGrandchildren') : t('noteHusbandQuarter')) 
        : t('noteHusbandHalf');
      
      const activeDescendantsList = heirDetails.filter(hd => !blockingResults[hd.id]?.isBlocked && childrenTypes.concat(grandchildrenTypes).includes(hd.type));
      if (language === 'ar' && activeDescendantsList.length === 1 && activeDescendantsList[0].type === 'daughter' && !hasActiveFather && !hasActiveMother) {
        note = "الربع فرضا لوجود ابناء";
      }

      activeSpouses.forEach(sp => {
        shareMap[sp.id] = { percentage: spouseShareTotal, note };
      });
    } else {
      spouseShareTotal = hasActiveDescendants ? (100 / 8) : (100 / 4);
      const perWife = spouseShareTotal / activeSpouses.length;
      let note: string;
      if (activeSpouses.length > 1) {
        const wifeCount = activeSpouses.length;
        if (wifeCount === 2) {
          note = hasActiveDescendants 
            ? (isGrandchildrenOnly ? t('noteWife2EighthWithChildrenGC') : t('noteWife2EighthWithChildren'))
            : t('noteWife2QuarterNoChildren');
        } else if (wifeCount === 3) {
          note = hasActiveDescendants 
            ? (isGrandchildrenOnly ? t('noteWife3EighthWithChildrenGC') : t('noteWife3EighthWithChildren'))
            : t('noteWife3QuarterNoChildren');
        } else {
          note = hasActiveDescendants 
            ? (isGrandchildrenOnly ? t('noteWife4EighthWithChildrenGC') : t('noteWife4EighthWithChildren'))
            : t('noteWife4QuarterNoChildren');
        }
      } else {
        note = hasActiveDescendants 
          ? (isGrandchildrenOnly ? t('noteWifeEighthGrandchildren') : t('noteWifeEighth'))
          : t('noteWifeQuarter');
      }
      activeSpouses.forEach(sp => {
        shareMap[sp.id] = { percentage: perWife, note };
      });
    }
  }

  let remainingPercentage = 100 - spouseShareTotal;

  const hasActiveWife = activeSpouses.some(s => s.type === 'wife');
  const hasActiveHusband = activeSpouses.some(s => s.type === 'husband');
  const hasActiveGrandmother = grandmotherTypes.some(gt => (activeHeirCounts[gt] || 0) > 0) && !hasActiveMother;

  let fatherShare = 0;

  if (!isDaughterOnlyPath && hasActiveFather && hasActiveDescendants) {
    fatherShare = 100 / 6;
    const fatherId = heirDetails.find(h => h.type === 'father' && !blockingResults[h.id]?.isBlocked)?.id;
    if (fatherId) {
      const sonCount = activeHeirCounts['son'] || 0;
      const daughterCount = activeHeirCounts['daughter'] || 0;
      const totalChildren = sonCount + daughterCount;
      const fatherNote = hasActiveSons ? (totalChildren >= 2 ? t('noteFatherSixthWithSons') : t('noteFatherSixthWithSon')) : t('noteFatherWithChildren');
      shareMap[fatherId] = { percentage: fatherShare, note: fatherNote };
    }
  }

  let grandfatherPaternalShare = 0;
  if (!isDaughterOnlyPath && !hasActiveFather && hasActiveDescendants && !hasActiveGrandchildren) {
    const activeGFP = heirDetails.find(h =>
      h.type === 'grandfatherPaternal' && !blockingResults[h.id]?.isBlocked
    );
    if (activeGFP) {
      grandfatherPaternalShare = 100 / 6;
      shareMap[activeGFP.id] = { percentage: grandfatherPaternalShare, note: t('noteGFPaternalSixthWithDescendants') };
    }
  }

  let motherShare = 0;

  if (!isDaughterOnlyPath && hasActiveMother) {
    const motherId = heirDetails.find(h => h.type === 'mother' && !blockingResults[h.id]?.isBlocked)?.id;
    if (motherId) {
      if (hasActiveDescendants) {
        motherShare = 100 / 6;
        const motherSonCount = activeHeirCounts['son'] || 0;
        const motherDaughterCount = activeHeirCounts['daughter'] || 0;
        const motherTotalChildren = motherSonCount + motherDaughterCount;
        const motherNote = hasActiveSons ? (motherTotalChildren >= 2 ? t('noteMotherSixthWithSons') : t('noteMotherSixthWithSon')) : t('noteMotherWithChildren');
        shareMap[motherId] = { percentage: motherShare, note: motherNote };
      } else if (motherReducedBySiblings) {
        motherShare = 100 / 6;
        shareMap[motherId] = { percentage: motherShare, note: getMotherSiblingNote() };
      } else {
        motherShare = 100 / 3;
        const hasActiveGMs = heirDetails.some(h => grandmotherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked);
        const isRaddScenario = (activeSpouses.length > 0 || hasActiveGMs) && !hasActiveFather && !hasActiveDescendants && !hasActiveSiblings;
        const motherNote = isRaddScenario ? t('noteMotherThirdWithSpouse') : t('noteMotherThird');
        shareMap[motherId] = { percentage: motherShare, note: motherNote };
      }
    }
  }

  let grandfatherMaternalShare = 0;
  if (!isDaughterOnlyPath && !hasActiveMother && hasActiveDescendants && !hasActiveGrandchildren) {
    const activeGFM = heirDetails.find(h =>
      h.type === 'grandfatherMaternal' && !blockingResults[h.id]?.isBlocked
    );
    if (activeGFM) {
      grandfatherMaternalShare = 100 / 6;
      shareMap[activeGFM.id] = { percentage: grandfatherMaternalShare, note: t('noteGFMaternalSixthWithDescendants') };
    }
  }

  remainingPercentage = 100 - spouseShareTotal - fatherShare - motherShare - grandfatherPaternalShare - grandfatherMaternalShare;

  let grandmotherShareTotal = 0;

  if (!isDaughterOnlyPath && !unclesAreMainHeirs && !grandparentsAreMainHeirs) {
    const activeGrandmothers = heirDetails.filter(h =>
      grandmotherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );
    if (activeGrandmothers.length > 0) {
      const sixthShare = 100 / 6;
      activeGrandmothers.forEach(h => {
        shareMap[h.id] = { 
          percentage: sixthShare, 
          note: (hasActiveFather || hasActiveMother) ? t('noteGrandmotherSixth') : t('noteGrandmotherSixthSunnah') 
        };
        grandmotherShareTotal += sixthShare;
      });
      remainingPercentage -= grandmotherShareTotal;
    }
  }

  if (hasActiveChildren || isDaughterOnlyPath) {
    const sonCount = activeHeirCounts['son'] || 0;
    const daughterCount = activeHeirCounts['daughter'] || 0;

    if (sonCount > 0 && daughterCount > 0) {
      const totalUnits = sonCount * 2 + daughterCount;
      const perUnit = remainingPercentage / totalUnits;

      const hasParentsOrGrand = (activeHeirCounts['father'] || 0) > 0 || (activeHeirCounts['mother'] || 0) > 0 || 
        (activeHeirCounts['grandmotherPaternal'] || 0) > 0 || (activeHeirCounts['grandmotherMaternal'] || 0) > 0 ||
        (activeHeirCounts['grandfatherPaternal'] || 0) > 0 || (activeHeirCounts['grandfatherMaternal'] || 0) > 0;
      const childrenNote = hasParentsOrGrand ? t('noteChildrenResiduary') : t('noteChildrenResiduaryAlone');

      heirDetails.filter(h => h.type === 'son' && !blockingResults[h.id]?.isBlocked).forEach(h => {
        shareMap[h.id] = { percentage: perUnit * 2, note: childrenNote };
      });
      heirDetails.filter(h => h.type === 'daughter' && !blockingResults[h.id]?.isBlocked).forEach(h => {
        shareMap[h.id] = { percentage: perUnit, note: childrenNote };
      });
      remainingPercentage = 0;

    } else if (sonCount > 0) {
      let sonNote: string;
      if (sonCount >= 2) {
        sonNote = t('noteSonsResiduaryEqual');
      } else if (hasActiveWife) {
        sonNote = t('sonNoteWithWife');
      } else if (hasActiveHusband) {
        sonNote = t('sonNoteWithHusband');
      } else if (hasActiveFather && hasActiveMother) {
        sonNote = t('sonNoteWithFatherMother');
      } else if (hasActiveFather) {
        sonNote = t('sonNoteWithFather');
      } else if (hasActiveMother) {
        sonNote = t('sonNoteWithMother');
      } else if (hasActiveGrandmother) {
        sonNote = t('sonNoteWithGrandmother');
      } else {
        sonNote = t('noteSonAlone');
      }

      const perSon = remainingPercentage / sonCount;
      heirDetails.filter(h => h.type === 'son' && !blockingResults[h.id]?.isBlocked).forEach(h => {
        shareMap[h.id] = { percentage: perSon, note: sonNote };
      });
      remainingPercentage = 0;

    } else if (daughterCount > 0 || hasActiveMaternalGC) {
      const branchGroups = new Map<string, { heirs: HeirDetail[], weight: number, parentType: 'son' | 'daughter' }>();
      const activeMGC = heirDetails.filter(h => (h.type === 'sonOfDaughter' || h.type === 'daughterOfDaughter') && !blockingResults[h.id]?.isBlocked);
      
      if (daughterCount > 0) {
        heirDetails.filter(h => h.type === 'daughter' && !blockingResults[h.id]?.isBlocked).forEach(d => {
          branchGroups.set(d.name || d.id, { heirs: [d], weight: 1, parentType: 'daughter' });
        });
      } else {
        activeMGC.forEach(gc => {
          const parentNameStr = gc.parentName ? gc.parentName.trim() : '';
          const parentKey = parentNameStr ? `daughter::${parentNameStr}` : (language === 'ar' ? 'مجهول_daughter' : 'Unknown_daughter');
          if (!branchGroups.has(parentKey)) {
            branchGroups.set(parentKey, { heirs: [], weight: 1, parentType: 'daughter' });
          }
          branchGroups.get(parentKey)!.heirs.push(gc);
        });
      }

      const branchCount = branchGroups.size;
      const branchFard = branchCount === 1 ? (1 / 2) : (2 / 3);

      const raddGroup: { type: string; fard: number }[] = [];
      if (daughterCount > 0) {
        raddGroup.push({ fard: branchFard, type: 'daughter' });
      } else {
        raddGroup.push({ fard: branchFard, type: 'maternalGC' });
      }

      if (hasActiveFather) {
        raddGroup.push({ fard: 1 / 6, type: 'father' });
      } else {
        const gfpInRadd = heirDetails.find(h => h.type === 'grandfatherPaternal' && !blockingResults[h.id]?.isBlocked);
        if (gfpInRadd) {
          raddGroup.push({ fard: 1 / 6, type: 'grandfatherPaternal' });
        }
      }
      if (hasActiveMother) {
        raddGroup.push({ fard: 1 / 6, type: 'mother' });
      } else {
        const gfmInRadd = heirDetails.find(h => h.type === 'grandfatherMaternal' && !blockingResults[h.id]?.isBlocked);
        if (gfmInRadd) {
          raddGroup.push({ fard: 1 / 6, type: 'grandfatherMaternal' });
        }
      }

      const raddParentCount = raddGroup.length - 1;

      let gmFixedShare = 0;
      let activeGMCount = 0;
      if (!hasActiveMother) {
        const activeGrandmothers = heirDetails.filter(h =>
          grandmotherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
        );
        activeGMCount = activeGrandmothers.length;
        if (activeGrandmothers.length > 0) {
          gmFixedShare = 100 / 6;
          const perGm = gmFixedShare / activeGrandmothers.length;
          activeGrandmothers.forEach(h => {
            shareMap[h.id] = { note: t('noteGrandmotherSixthSunnah'), percentage: perGm };
          });
        }
      }

      const remainingForRadd = 100 - spouseShareTotal - gmFixedShare;
      const totalRaddFard = raddGroup.reduce((s, p) => s + p.fard, 0);

      raddGroup.forEach(p => {
        const share = (p.fard / totalRaddFard) * remainingForRadd;

        if (p.type === 'daughter' || p.type === 'maternalGC') {
          let mainNote: string;
          if (branchCount === 1) {
            if (raddParentCount >= 2) {
              mainNote = t('daughterNoteHalfRaddAll');
            } else if (raddParentCount === 1) {
              mainNote = t('daughterNoteHalfRaddTwo');
            } else {
              if (hasActiveWife) {
                mainNote = t('daughterNoteWithWife');
              } else if (hasActiveHusband) {
                mainNote = t('daughterNoteWithHusband');
                if (language === 'ar' && !hasActiveFather && !hasActiveMother && branchCount === 1 && daughterCount === 1) {
                  mainNote = "النصف فرضاً والباقي رحماً";
                }
              } else if (gmFixedShare > 0) {
                mainNote = activeGMCount >= 2 ? t('daughterNoteWithTwoGrandmothers') : t('daughterNoteWithGrandmother');
              } else {
                mainNote = t('daughterNoteHalfRahm');
              }
            }
          } else {
            const isPlural = branchCount > 2;
            if (raddParentCount >= 2) {
              mainNote = isPlural ? t('daughtersNoteTwoThirdsCompletePlural') : t('daughtersNoteTwoThirdsComplete');
            } else if (raddParentCount === 1) {
              mainNote = isPlural ? t('daughterNoteTwoThirdsRaddTwoPlural') : t('daughterNoteTwoThirdsRaddTwo');
            } else {
              if (hasActiveWife) {
                mainNote = isPlural ? t('twoDaughtersNoteWithWifePlural') : t('twoDaughtersNoteWithWife');
              } else if (hasActiveHusband) {
                mainNote = isPlural ? t('twoDaughtersNoteWithHusbandPlural') : t('twoDaughtersNoteWithHusband');
              } else if (gmFixedShare > 0) {
                if (activeGMCount >= 2) {
                  mainNote = isPlural ? t('daughtersNoteTwoThirdsWithTwoGMsPlural') : t('daughtersNoteTwoThirdsWithTwoGMs');
                } else {
                  mainNote = isPlural ? t('daughtersNoteTwoThirdsRahmEqualPlural') : t('daughtersNoteTwoThirdsRahmEqual');
                }
              } else {
                mainNote = isPlural ? t('daughterNoteTwoThirdsRahmPlural') : t('daughterNoteTwoThirdsRahm');
              }
            }
          }

          if (p.type === 'daughter') {
            const perDaughter = share / daughterCount;
            heirDetails.filter(h => h.type === 'daughter' && !blockingResults[h.id]?.isBlocked).forEach(h => {
              shareMap[h.id] = { note: mainNote, percentage: perDaughter };
            });
          } else {
            const perBranch = share / branchCount;
            branchGroups.forEach((branch, parentKey) => {
              const parentNameToShow = parentKey.includes('::') 
                ? parentKey.split('::')[1] 
                : (parentKey.startsWith('Unknown_') || parentKey.startsWith('مجهول_') 
                   ? (language === 'ar' ? 'مجهول' : 'Unknown') 
                   : parentKey);
              const perChild = perBranch / branch.heirs.length;
              branch.heirs.forEach(h => {
                let note = '';
                if (branchCount === 1) {
                  const heirsCount = branch.heirs.length;
                  if (heirsCount === 1) {
                    note = t('maternalGCNoteHalfRaddAll');
                  } else {
                    if (language === 'ar') {
                      note = `النصف فرضاً لأبناء وبنات ${parentNameToShow} يقسم بينهم بالسوية والباقي يرد عليهم حسب سهامهم`;
                    } else {
                      note = t('maternalGCNoteHalfRaddAll');
                    }
                  }
                } else {
                  const trans = translations[language];
                  const isMale = getGender(h.type) === 'male';
                  const getSharesLabel = (count: number) => {
                    if (count === 1) return trans.shares1;
                    if (count === 2) return trans.shares2;
                    return trans.sharesPlural.replace('{n}', count.toString());
                  };
                  const totalSharesLabel = getSharesLabel(branchCount);
                  const parentGenderVerb = trans.verbFemale;

                  let internalDist = '';
                  if (branch.heirs.length === 1) {
                    internalDist = isMale ? trans.maternalSonRef : trans.maternalDaughterRef;
                  } else if (branch.heirs.length === 2) {
                    internalDist = `${trans.maternalSonDaughterRef} ${trans.ruleEqual}`;
                  } else {
                    internalDist = `${trans.maternalSonsDaughtersRef} ${trans.ruleEqual}`;
                  }

                  const fractionLabel = trans.twoThirdsLabel;
                  const onLabel = language === 'ar' ? 'على' : (language === 'ur' ? 'پر' : 'on');
                  
                  note = `${fractionLabel} ${onLabel} ${totalSharesLabel} ${parentGenderVerb} (${parentNameToShow}) ${onLabel} ${trans.shareSingular} ${trans.connectorBranch} ${internalDist} ${language === 'ar' ? 'والباقي يرد عليهم حسب سهامهم' : (language === 'ur' ? 'اور باقی ان کے حصص کے مطابق واپس' : 'and the remainder is returned proportionally')}`;
                }
                shareMap[h.id] = { note, percentage: perChild };
              });
            });
          }

        } else if (p.type === 'father') {
          const fatherId = heirDetails.find(h => h.type === 'father' && !blockingResults[h.id]?.isBlocked)?.id;
          if (fatherId) {
            let fatherNote: string;
            if (branchCount >= 2 && raddParentCount >= 2) {
              fatherNote = t('fatherNoteSixthComplete');
            } else if (branchCount >= 2 || raddGroup.length >= 3) {
              fatherNote = t('fatherNoteSixthRaddAll');
            } else {
              fatherNote = t('fatherNoteSixthRaddTwo');
            }
            shareMap[fatherId] = { note: fatherNote, percentage: share };
          }

        } else if (p.type === 'mother') {
          const motherId = heirDetails.find(h => h.type === 'mother' && !blockingResults[h.id]?.isBlocked)?.id;
          if (motherId) {
            let motherNote: string;
            const activeSonOfDaughter = heirDetails.some(h => h.type === 'sonOfDaughter' && !blockingResults[h.id]?.isBlocked);
            const activeDaughterOfDaughter = heirDetails.some(h => h.type === 'daughterOfDaughter' && !blockingResults[h.id]?.isBlocked);

            if (activeSonOfDaughter && activeDaughterOfDaughter) {
              motherNote = t('motherNoteSixthRaddAll');
            } else if (branchCount >= 2 && raddParentCount >= 2) {
              motherNote = t('motherNoteSixthComplete');
            } else if (branchCount >= 2 || raddGroup.length >= 3) {
              motherNote = t('motherNoteSixthRaddAll');
            } else {
              motherNote = t('motherNoteSixthRaddTwo');
            }
            shareMap[motherId] = { note: motherNote, percentage: share };
          }
        } else if (p.type === 'grandfatherPaternal') {
          const gfpId = heirDetails.find(h => h.type === 'grandfatherPaternal' && !blockingResults[h.id]?.isBlocked)?.id;
          if (gfpId) {
            shareMap[gfpId] = { note: t('noteGFPaternalRaddWithDaughter'), percentage: share };
          }
        } else if (p.type === 'grandfatherMaternal') {
          const gfmId = heirDetails.find(h => h.type === 'grandfatherMaternal' && !blockingResults[h.id]?.isBlocked)?.id;
          if (gfmId) {
            shareMap[gfmId] = { note: t('noteGFMaternalRaddWithDaughter'), percentage: share };
          }
        }
      });

      remainingPercentage = 0;
    }
  } else if (hasActiveGrandchildren) {
    const activeGrandchildren = heirDetails.filter(h =>
      grandchildrenTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );

    const branchGroups = new Map<string, { heirs: HeirDetail[], weight: number, parentType: 'son' | 'daughter' }>();
    
    activeGrandchildren.forEach(gc => {
      const parentNameStr = gc.parentName ? gc.parentName.trim() : '';
      const isFromSon = gc.type === 'sonOfSon' || gc.type === 'daughterOfSon';
      const defaultParent = isFromSon ? 'son' : 'daughter';
      const parentKey = parentNameStr ? `${defaultParent}::${parentNameStr}` : (language === 'ar' ? `مجهول_${defaultParent}` : `Unknown_${defaultParent}`);
      if (!branchGroups.has(parentKey)) {
        branchGroups.set(parentKey, {
          heirs: [],
          parentType: isFromSon ? 'son' : 'daughter',
          weight: isFromSon ? 2 : 1
        });
      }
      branchGroups.get(parentKey)!.heirs.push(gc);
    });

    const gcdHelper = (a: number, b: number): number => a ? gcdHelper(b % a, a) : b;
    const weights = Array.from(branchGroups.values()).map(b => b.weight);
    const overallGcd = weights.reduce((g, w) => gcdHelper(g, w), weights[0] || 1);
    
    const totalSharesCount = Array.from(branchGroups.values()).reduce((sum, b) => sum + (b.weight / overallGcd), 0);
    const perShareUnit = remainingPercentage / totalSharesCount;

    branchGroups.forEach((branch, parentKey) => {
      const parentNameToShow = parentKey.includes('::') 
        ? parentKey.split('::')[1] 
        : (parentKey.startsWith('Unknown_') || parentKey.startsWith('مجهول_') 
           ? (language === 'ar' ? 'مجهول' : 'Unknown') 
           : parentKey);
      const simplifiedWeight = branch.weight / overallGcd;
      const branchTotalPercentage = perShareUnit * simplifiedWeight;
      
      let branchInternalUnits = 0;
      branch.heirs.forEach(h => {
        if (branch.parentType === 'son') {
          branchInternalUnits += getGender(h.type) === 'male' ? 2 : 1;
        } else {
          branchInternalUnits += 1;
        }
      });

      const perInternalUnit = branchTotalPercentage / branchInternalUnits;

      branch.heirs.forEach(h => {
        const hUnits = (branch.parentType === 'son') ? (getGender(h.type) === 'male' ? 2 : 1) : 1;
        const hPercentage = perInternalUnit * hUnits;
        const isMale = getGender(h.type) === 'male';

        let note = '';
        if (activeGrandchildren.length === 1) {
          note = t('residueOnly');
        } else {
          const trans = translations[language];
          const getSharesLabel = (count: number) => {
            if (count === 1) return trans.shares1;
            if (count === 2) return trans.shares2;
            return trans.sharesPlural.replace('{n}', count.toString());
          };
          const getParentSharesLabel = (count: number) => {
            if (count === 1) return trans.shareSingular;
            if (count === 2) return trans.shares2;
            return trans.sharesPlural.replace('{n}', count.toString());
          };

          const totalSharesLabel = getSharesLabel(totalSharesCount);
          const parentSharesLabel = getParentSharesLabel(simplifiedWeight);
          const parentGenderVerb = branch.parentType === 'son' ? trans.verbMale : trans.verbFemale;
          const connector = trans.connectorBranch;
          const onLabel = language === 'ar' ? 'على' : (language === 'ur' ? 'پر' : 'on');

          if (branch.heirs.length === 1) {
            let actualTarget = '';
            if (branch.parentType === 'son') {
              actualTarget = isMale ? trans.sonRef : trans.daughterRef;
            } else {
              actualTarget = isMale ? trans.maternalSonRef : trans.maternalDaughterRef;
            }
            note = `${trans.remainderLabel} ${onLabel} ${totalSharesLabel} ${parentGenderVerb} (${parentNameToShow}) ${onLabel} ${parentSharesLabel} ${connector} ${actualTarget}`;
          } else {
            const rule = branch.parentType === 'son' ? trans.ruleMaleDouble : trans.ruleEqual;
            let childRef = '';
            if (branch.heirs.length === 2) {
              childRef = branch.parentType === 'son' ? trans.sonDaughterRef : trans.maternalSonDaughterRef;
            } else {
              childRef = branch.parentType === 'son' ? trans.sonsDaughtersRef : trans.maternalSonsDaughtersRef;
            }
            note = `${trans.remainderLabel} ${onLabel} ${totalSharesLabel} ${parentGenderVerb} (${parentNameToShow}) ${onLabel} ${parentSharesLabel} ${connector} ${childRef} ${rule}`;
          }
        }

        shareMap[h.id] = { note, percentage: hPercentage };
      });
    });

    remainingPercentage = 0;
  }

  if (!hasActiveDescendants && hasActiveFather && remainingPercentage > 0) {
    const fatherId = heirDetails.find(h => h.type === 'father' && !blockingResults[h.id]?.isBlocked)?.id;
    const motherId = heirDetails.find(h => h.type === 'mother' && !blockingResults[h.id]?.isBlocked)?.id;
    
    const hasOnlyFatherMother = hasActiveFather && hasActiveMother && !hasActiveDescendants && activeSpouses.length === 0;
    const otherActiveHeirs = heirDetails.filter(h => 
      !blockingResults[h.id]?.isBlocked && 
      h.type !== 'father' && h.type !== 'mother' && 
      !spouseTypes.includes(h.type)
    );
    const isFatherMotherOnly = hasOnlyFatherMother && otherActiveHeirs.length === 0;
    
    if (isFatherMotherOnly && fatherId && motherId) {
      const totalForBoth = 100 - spouseShareTotal;
      
      if (motherReducedBySiblings) {
        const motherS = totalForBoth / 6;
        shareMap[motherId] = { note: getMotherSiblingNote(), percentage: motherS };
        shareMap[fatherId] = { note: t('noteFatherResiduary'), percentage: totalForBoth - motherS };
      } else {
        const hasGrandmothers = (activeHeirCounts['grandmotherPaternal'] || 0) > 0 || (activeHeirCounts['grandmotherMaternal'] || 0) > 0;
        const fatherNote = hasGrandmothers ? t('noteFatherResiduary') : t('noteFatherTwoThirdsWithMother');
        shareMap[motherId] = { note: t('noteMotherThirdWithFather'), percentage: totalForBoth / 3 };
        shareMap[fatherId] = { note: fatherNote, percentage: (totalForBoth * 2) / 3 };
      }
      remainingPercentage = 0;
    } else if (fatherId) {
      const allActiveHeirs = heirDetails.filter(h => !blockingResults[h.id]?.isBlocked);
      const isAlone = allActiveHeirs.length === 1 && allActiveHeirs[0].type === 'father';
      
      if (shareMap[fatherId]) {
        shareMap[fatherId].percentage += remainingPercentage;
      } else {
        shareMap[fatherId] = { 
          note: (isAlone || remainingPercentage >= 99.9) ? t('noteFatherAll') : t('noteFatherResiduary'), 
          percentage: remainingPercentage 
        };
      }
      
      if (shareMap[fatherId].percentage >= 99.9 && isAlone) {
        shareMap[fatherId].note = t('noteFatherAll');
      }
      
      remainingPercentage = 0;
    }
  }

  if (!hasActiveFather && !hasActiveDescendants) {
    const activeGrandfathersHere = heirDetails.filter(h =>
      grandfatherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
    );
    const activeGrandmothersHere = heirDetails.filter(h =>
      grandmotherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
    );
    const hasActiveSiblingsForGF = heirDetails.some(h =>
      siblingTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );

    if (grandparentsAreMainHeirs && !hasActiveSiblingsForGF && !hasActiveNephewsNieces && remainingPercentage > 0) {
      const hasGFPaternal = activeGrandfathersHere.some(h => h.type === 'grandfatherPaternal');
      const hasGFMaternal = activeGrandfathersHere.some(h => h.type === 'grandfatherMaternal');
      const hasGMPaternal = activeGrandmothersHere.some(h => h.type === 'grandmotherPaternal');
      const hasGMMaternal = activeGrandmothersHere.some(h => h.type === 'grandmotherMaternal');
      
      const hasPaternalSide = hasGFPaternal || hasGMPaternal;
      const hasMaternalSide = hasGFMaternal || hasGMMaternal;
      
      if (hasPaternalSide && hasMaternalSide) {
        const totalPool = remainingPercentage;
        const hasSpouseShareHere = activeSpouses.some(s => shareMap[s.id] && shareMap[s.id].percentage > 0);
        const paternalPool = totalPool * 2 / 3;
        const maternalPool = totalPool / 3;
        
        const paternalMembers: { id: string; isMale: boolean }[] = [];
        if (hasGFPaternal) {
          const gf = activeGrandfathersHere.find(h => h.type === 'grandfatherPaternal');
          if (gf) paternalMembers.push({ id: gf.id, isMale: true });
        }
        if (hasGMPaternal) {
          const gm = activeGrandmothersHere.find(h => h.type === 'grandmotherPaternal');
          if (gm) paternalMembers.push({ id: gm.id, isMale: false });
        }
        
        const isAllFourGrandparentsPresent = hasGFPaternal && hasGMPaternal && hasGFMaternal && hasGMMaternal;

        const paternalUnits = paternalMembers.reduce((s, m) => s + (m.isMale ? 2 : 1), 0);
        const perPaternalUnit = paternalPool / paternalUnits;
        paternalMembers.forEach(m => {
          const units = m.isMale ? 2 : 1;
          let note: string;
          if (isAllFourGrandparentsPresent) {
            note = t('noteGPPaternalBothWithMaternal');
          } else if (hasSpouseShareHere && paternalMembers.length > 1) {
            note = m.isMale ? t('noteGFPaternalTwoSharesFromRemainder') : t('noteGMPaternalOneShareFromRemainder');
          } else if (hasSpouseShareHere) {
            note = t('noteGPPaternalWithMaternalAndSpouse');
          } else if (paternalMembers.length > 1) {
            note = t('noteGPPaternalBothWithMaternal');
          } else {
            note = t('noteGPPaternalWithMaternal');
          }
          shareMap[m.id] = { note, percentage: perPaternalUnit * units };
        });
        
        const maternalMembers: { id: string; isMale: boolean }[] = [];
        if (hasGFMaternal) {
          const gf = activeGrandfathersHere.find(h => h.type === 'grandfatherMaternal');
          if (gf) maternalMembers.push({ id: gf.id, isMale: true });
        }
        if (hasGMMaternal) {
          const gm = activeGrandmothersHere.find(h => h.type === 'grandmotherMaternal');
          if (gm) maternalMembers.push({ id: gm.id, isMale: false });
        }
        
        const perMaternal = maternalPool / maternalMembers.length;
        maternalMembers.forEach(m => {
          let note: string;
          if (isAllFourGrandparentsPresent) {
            note = t('noteGPMaternalBothWithPaternal');
          } else if (hasSpouseShareHere && maternalMembers.length > 1) {
            note = m.isMale ? t('noteGFMaternalSixthWithSpouse') : t('noteGMMaternalSixthWithSpouse');
          } else if (hasSpouseShareHere) {
            note = t('noteGPMaternalWithPaternalAndSpouse');
          } else if (maternalMembers.length > 1) {
            note = t('noteGPMaternalBothWithPaternal');
          } else {
            note = t('noteGPMaternalWithPaternal');
          }
          shareMap[m.id] = { note, percentage: perMaternal };
        });
        
        remainingPercentage = 0;
        
      } else if (hasPaternalSide && !hasMaternalSide && !unclesAreMainHeirs) {
        const paternalMembers: { id: string; isMale: boolean }[] = [];
        if (hasGFPaternal) {
          const gf = activeGrandfathersHere.find(h => h.type === 'grandfatherPaternal');
          if (gf) paternalMembers.push({ id: gf.id, isMale: true });
        }
        if (hasGMPaternal) {
          const gm = activeGrandmothersHere.find(h => h.type === 'grandmotherPaternal');
          if (gm) paternalMembers.push({ id: gm.id, isMale: false });
        }
        
        if (paternalMembers.length === 1) {
          const isFemale = !paternalMembers[0].isMale;
          const hasSpouseShareHere = activeSpouses.some(s => shareMap[s.id] && shareMap[s.id].percentage > 0);
          let note: string;
          if (hasSpouseShareHere) {
            note = t('noteGrandfatherPaternalResiduary');
          } else {
            note = isFemale ? t('noteGPPaternalAloneFemale') : t('noteGPPaternalAlone');
          }
          shareMap[paternalMembers[0].id] = { note, percentage: remainingPercentage };
        } else {
          const paternalUnits = paternalMembers.reduce((s, m) => s + (m.isMale ? 2 : 1), 0);
          const perUnit = remainingPercentage / paternalUnits;
          paternalMembers.forEach(m => {
            const units = m.isMale ? 2 : 1;
            const note = m.isMale ? t('noteGFPaternalShare') : t('noteGMPaternalShareWithGF');
            shareMap[m.id] = { note, percentage: perUnit * units };
          });
        }
        remainingPercentage = 0;
        
      } else if (hasMaternalSide && !hasPaternalSide && !unclesAreMainHeirs) {
        const maternalMembers: { id: string; isMale: boolean }[] = [];
        if (hasGFMaternal) {
          const gf = activeGrandfathersHere.find(h => h.type === 'grandfatherMaternal');
          if (gf) maternalMembers.push({ id: gf.id, isMale: true });
        }
        if (hasGMMaternal) {
          const gm = activeGrandmothersHere.find(h => h.type === 'grandmotherMaternal');
          if (gm) maternalMembers.push({ id: gm.id, isMale: false });
        }
        
        if (maternalMembers.length === 1) {
          const isFemale = !maternalMembers[0].isMale;
          const hasSpouseShareHere = activeSpouses.some(s => shareMap[s.id] && shareMap[s.id].percentage > 0);
          let note: string;
          if (hasSpouseShareHere) {
            note = t('noteGrandfatherPaternalResiduary');
          } else {
            note = isFemale ? t('noteGPMaternalAloneFemale') : t('noteGPMaternalAlone');
          }
          shareMap[maternalMembers[0].id] = { note, percentage: remainingPercentage };
        } else {
          const perMember = remainingPercentage / maternalMembers.length;
          maternalMembers.forEach(m => {
            shareMap[m.id] = { note: t('noteGMMaternalWithGFMaternal'), percentage: perMember };
          });
        }
        remainingPercentage = 0;
      }
      
    } else if (activeGrandfathersHere.length > 0 && !hasActiveSiblingsForGF && !hasActiveNephewsNieces && remainingPercentage > 0 && !grandparentsAreMainHeirs && !unclesAreMainHeirs) {
      const gfShare = remainingPercentage;
      const perGf = gfShare / activeGrandfathersHere.length;
      activeGrandfathersHere.forEach(h => {
        const isMaternal = h.type === 'grandfatherMaternal';
        const hasSpouseShare = activeSpouses.some(s => shareMap[s.id] && shareMap[s.id].percentage > 0);
        let gfNote: string;
        if (isMaternal) {
          gfNote = t('noteGrandfatherLikeMother');
        } else if (hasSpouseShare) {
          gfNote = t('noteGrandfatherPaternalResiduary');
        } else {
          gfNote = t('noteGrandfatherLikeFather');
        }
        shareMap[h.id] = { note: gfNote, percentage: perGf };
      });
      remainingPercentage = 0;
    }
  }

  if (!hasActiveDescendants && !hasActiveFather && remainingPercentage > 0 && !unclesAreMainHeirs) {
    const maternalPoolMembers = heirDetails.filter(h =>
      (maternalSiblingTypes.includes(h.type) || 
       ((hasActiveSiblings || !hasActiveNephewsNieces) && (h.type === 'grandfatherMaternal' || (!hasActiveMother && h.type === 'grandmotherMaternal')))) &&
      !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
    );
    const hasActiveMaternalPool = maternalPoolMembers.length > 0;

    const paternalPoolMembers = heirDetails.filter(h =>
      (fullSiblingTypes.includes(h.type) || paternalSiblingTypes.includes(h.type) || 
       ((hasActiveSiblings || !hasActiveNephewsNieces) && (h.type === 'grandfatherPaternal' || (!hasActiveMother && (h.type === 'grandmotherPaternal' || h.type === 'grandmotherMaternal'))))) &&
      !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
    );
    const hasActivePaternalPool = paternalPoolMembers.length > 0;

    if (hasActiveMaternalPool && hasActivePaternalPool) {
      let maternalPoolShareTotal: number;
      const maternalCount = maternalPoolMembers.length;
      
      if (maternalCount === 1) {
        maternalPoolShareTotal = Math.min(100 / 6, remainingPercentage);
      } else {
        maternalPoolShareTotal = Math.min(100 / 3, remainingPercentage);
      }
      
      const perMember = maternalPoolShareTotal / maternalCount;
      
      maternalPoolMembers.forEach(h => {
        let maternalNote = '';
        if (maternalCount === 1) {
          if (h.type === 'grandfatherMaternal') maternalNote = t('noteGFMaternalAsBrother');
          else if (h.type === 'grandmotherMaternal') maternalNote = t('noteGMMaternalAsSister');
          else {
            const isFemale = getGender(h.type) === 'female';
            maternalNote = isFemale ? t('noteMaternalSisterAlone') : t('noteMaternalBrotherAlone');
          }
        } else {
          maternalNote = t('noteSiblingsMaternalThird');
        }
        let finalNote = maternalNote;
        if (h.type === 'grandmotherMaternal') finalNote = t('noteGMMaternalAsSister');
        else if (h.type === 'grandfatherMaternal') finalNote = t('noteGFMaternalAsBrother');
        
        shareMap[h.id] = { note: finalNote, percentage: perMember };
      });
      remainingPercentage -= maternalPoolShareTotal;
    } else if (hasActiveMaternalPool && !hasActivePaternalPool) {
      const perMember = remainingPercentage / maternalPoolMembers.length;
      const maternalCount = maternalPoolMembers.length;
      
      maternalPoolMembers.forEach(h => {
        let maternalNote = '';
        if (hasActiveGrandmother) {
          maternalNote = t('noteSiblingsWithGrandmother');
        } else if (maternalCount === 1) {
          if (h.type === 'brotherMaternal') maternalNote = t('noteMaternalBrotherAlone');
          else if (h.type === 'sisterMaternal') maternalNote = t('noteMaternalSisterAlone');
          else if (h.type === 'grandfatherMaternal') maternalNote = t('noteGFMaternalAsBrother');
          else if (h.type === 'grandmotherMaternal') maternalNote = t('noteGMMaternalAsSister');
          else maternalNote = t('noteMaternalSiblingsAlone');
        } else {
          maternalNote = t('noteMaternalSiblingsAlone');
        }
        shareMap[h.id] = { note: maternalNote, percentage: perMember };
      });
      remainingPercentage = 0;
    }

    if (hasActivePaternalPool && remainingPercentage > 0) {
      let totalUnits = 0;
      paternalPoolMembers.forEach(h => {
        const isMale = getGender(h.type) === 'male' || h.type === 'grandfatherPaternal';
        totalUnits += isMale ? 2 : 1;
      });

      const perUnit = remainingPercentage / totalUnits;
      const hasMixedGenders = paternalPoolMembers.some(h => getGender(h.type) === 'male' || h.type === 'grandfatherPaternal') && 
                               paternalPoolMembers.some(h => getGender(h.type) === 'female');

      const paternalMales = paternalPoolMembers.filter(m => getGender(m.type) === 'male' || m.type === 'grandfatherPaternal');
      const paternalFemales = paternalPoolMembers.filter(m => getGender(m.type) === 'female');
      const sistersOnlyCount = paternalPoolMembers.filter(m => m.type === 'sister' || m.type === 'sisterPaternal').length;

      paternalPoolMembers.forEach(h => {
        const isMale = getGender(h.type) === 'male' || h.type === 'grandfatherPaternal';
        const units = isMale ? 2 : 1;
        let note: string;
        
        if (h.type === 'grandfatherPaternal') {
          const allOthersMale = paternalPoolMembers.filter(m => m.id !== h.id).every(m => getGender(m.type) === 'male' || m.type === 'grandfatherPaternal');
          note = (allOthersMale && !hasMixedGenders) ? t('noteGFPaternalAsBrotherEqual') : t('noteGFPaternalAsBrother');
        } else if (h.type === 'grandmotherPaternal' || h.type === 'grandmotherMaternal') {
          note = t('noteGMPaternalAsSister');
        } else if (!paternalMales.length && (h.type === 'sister' || h.type === 'sisterPaternal')) {
          if (h.type === 'sisterPaternal') {
            note = sistersOnlyCount === 1 ? t('noteSisterPaternalAlone') : t('noteSistersTwoThirdsRadd');
          } else {
            note = sistersOnlyCount === 1 ? t('noteSisterAlone') : t('noteSistersTwoThirdsRadd');
          }
        } else if (hasMixedGenders) {
          note = (hasActiveMaternalPool || activeSpouses.length > 0 || hasActiveGrandmother) ? t('noteSiblingsResiduaryMixed') : t('notePaternalSiblingsAloneMixed');
        } else if (paternalPoolMembers.some(m => m.type === 'grandfatherPaternal')) {
          note = t('noteGFPaternalAsBrotherEqual');
        } else if (hasActiveGrandmother) {
          note = t('noteSiblingsWithGrandmother');
        } else if (paternalFemales.length === 0) {
          note = (hasActiveMaternalPool || activeSpouses.length > 0) ? t('noteSiblingsResiduary') : (paternalMales.length === 1 ? t('noteBrotherAlone') : t('noteBrothersAlone'));
        } else {
          note = (hasActiveMaternalPool || activeSpouses.length > 0) ? t('noteSiblingsResiduary') : t('notePaternalSiblingsAlone');
        }
        shareMap[h.id] = { note, percentage: perUnit * units };
      });
      remainingPercentage = 0;
    }
  }

  if (remainingPercentage > 0) {
    const activeNephewsNieces = heirDetails.filter(h =>
      nephewNieceTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );

    if (activeNephewsNieces.length > 0) {
      const activeGPsForNephews = heirDetails.filter(h =>
        (grandfatherTypes.includes(h.type) || grandmotherTypes.includes(h.type)) && 
        !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
      );
      const hasGPsWithNephews = activeGPsForNephews.length > 0;

      const getNephewParentType = (nephewType: string): { parentType: string; parentGender: 'male' | 'female'; side: 'full' | 'paternal' | 'maternal' } => {
        if (nephewType === 'brotherSon' || nephewType === 'brotherDaughter') return { parentGender: 'male', parentType: 'brother', side: 'full' };
        if (nephewType === 'sisterSon' || nephewType === 'sisterDaughter') return { parentGender: 'female', parentType: 'sister', side: 'full' };
        if (nephewType === 'brotherSonMaternal' || nephewType === 'brotherDaughterMaternal') return { parentGender: 'male', parentType: 'brotherMaternal', side: 'maternal' };
        if (nephewType === 'sisterSonMaternal' || nephewType === 'sisterDaughterMaternal') return { parentGender: 'female', parentType: 'sisterMaternal', side: 'maternal' };
        if (nephewType === 'brotherSonPaternal' || nephewType === 'brotherDaughterPaternal') return { parentGender: 'male', parentType: 'brotherPaternal', side: 'paternal' };
        if (nephewType === 'sisterSonPaternal' || nephewType === 'sisterDaughterPaternal') return { parentGender: 'female', parentType: 'sisterPaternal', side: 'paternal' };
        return { parentGender: 'male', parentType: 'brother', side: 'full' };
      };

      if (hasGPsWithNephews) {
        const virtualParentMap = new Map<string, { parentGender: 'male' | 'female'; side: string; children: HeirDetail[] }>();
        activeNephewsNieces.forEach(nn => {
          const parentInfo = getNephewParentType(nn.type);
          if (!virtualParentMap.has(parentInfo.parentType)) {
            virtualParentMap.set(parentInfo.parentType, { children: [], parentGender: parentInfo.parentGender, side: parentInfo.side });
          }
          virtualParentMap.get(parentInfo.parentType)!.children.push(nn);
        });

        interface PoolMember {
          id: string;
          units: number;
          isGrandparent: boolean;
          isMaternal: boolean;
          type: string;
          virtualParentKey?: string;
        }
        const pool: PoolMember[] = [];

        activeGPsForNephews.forEach(gp => {
          const isMaternalSide = gp.type === 'grandfatherMaternal' || gp.type === 'grandmotherMaternal';
          let units = 1;
          if (!isMaternalSide) {
             units = (gp.type === 'grandfatherPaternal') ? 2 : 1;
          }
          pool.push({ id: gp.id, isGrandparent: true, isMaternal: isMaternalSide, type: gp.type, units });
        });

        virtualParentMap.forEach((group, parentKey) => {
          const isMaternal = group.side === 'maternal';
          const units = isMaternal ? 1 : (group.parentGender === 'male' ? 2 : 1);
          pool.push({ id: `_virtual_${parentKey}`, isGrandparent: false, isMaternal, type: 'virtual', units, virtualParentKey: parentKey });
        });

        const totalPoolUnits = pool.reduce((s, m) => s + m.units, 0);
        const perPoolUnit = remainingPercentage / totalPoolUnits;

        pool.forEach(member => {
          const memberShare = perPoolUnit * member.units;

          if (member.isGrandparent) {
            let note = '';
            if (member.isMaternal) {
               note = t('noteGFMaternalAsBrother');
            } else {
               note = t('noteGFPaternalAsBrother');
            }
            shareMap[member.id] = { note, percentage: memberShare };
          } else if (member.virtualParentKey) {
            const group = virtualParentMap.get(member.virtualParentKey)!;
            const isMaternal = member.isMaternal;

            if (group.children.length === 1) {
              const child = group.children[0];
              const isMaleChild = getGender(child.type) === 'male';
              let actualTarget = '';
              if (group.parentGender === 'male') {
                actualTarget = isMaleChild ? t('sonRef') : t('daughterRef');
              } else {
                actualTarget = isMaleChild ? t('maternalSonRef') : t('maternalDaughterRef');
              }
              const note = `${t('remainderLabel')} ${language === 'ar' ? 'على' : language === 'ur' ? 'پر' : 'on'} ${member.units}/${totalPoolUnits} (${member.virtualParentKey}) ${t('connectorBranch')} ${actualTarget}`;
              shareMap[child.id] = { note, percentage: memberShare };
            } else {
              const childRef = group.parentGender === 'male' ? t('sonDaughterRef') : t('maternalSonDaughterRef');
              const rule = (isMaternal || group.parentGender === 'female') ? t('ruleEqual') : t('ruleMaleDouble');
              const note = `${t('remainderLabel')} ${language === 'ar' ? 'على' : language === 'ur' ? 'پر' : 'on'} ${member.units}/${totalPoolUnits} (${member.virtualParentKey}) ${t('connectorBranch')} ${childRef} ${rule}`;
              
              const internalUnits = isMaternal || group.parentGender === 'female' ? group.children.length : group.children.reduce((s, c) => s + (getGender(c.type) === 'male' ? 2 : 1), 0);
              const perInternalUnit = memberShare / internalUnits;
              
              group.children.forEach(child => {
                const u = isMaternal || group.parentGender === 'female' ? 1 : (getGender(child.type) === 'male' ? 2 : 1);
                shareMap[child.id] = { note, percentage: perInternalUnit * u };
              });
            }
          }
        });
        remainingPercentage = 0;

      } else {
        const virtualParentMap = new Map<string, { parentGender: 'male' | 'female'; side: string; children: HeirDetail[] }>();
        activeNephewsNieces.forEach(nn => {
          const parentInfo = getNephewParentType(nn.type);
          const parentNameStr = nn.parentName ? nn.parentName.trim() : '';
          const parentKey = parentNameStr ? `${parentInfo.parentType}::${parentNameStr}` : parentInfo.parentType;
          if (!virtualParentMap.has(parentKey)) {
            virtualParentMap.set(parentKey, { children: [], parentGender: parentInfo.parentGender, side: parentInfo.side });
          }
          virtualParentMap.get(parentKey)!.children.push(nn);
        });

        const virtualParentPool: { key: string; units: number; parentGender: 'male' | 'female'; side: string }[] = [];
        virtualParentMap.forEach((group, key) => {
          const units = group.side === 'maternal' ? 1 : (group.parentGender === 'male' ? 2 : 1);
          virtualParentPool.push({ key, parentGender: group.parentGender, side: group.side, units });
        });

        const paternalBranches = virtualParentPool.filter(bp => bp.side !== 'maternal');
        const maternalBranches = virtualParentPool.filter(bp => bp.side === 'maternal');

        let maternalPoolShare = 0;
        let paternalPoolShare = 0;

        if (paternalBranches.length > 0 && maternalBranches.length > 0) {
          if (paternalBranches.length === 1 && maternalBranches.length === 1 && paternalBranches[0].parentGender === 'female') {
            maternalPoolShare = remainingPercentage / 4;
          } else {
            const maternalSideBaseShare = (maternalBranches.length >= 2 ? (100 / 3) : (100 / 6));
            maternalPoolShare = maternalSideBaseShare * (remainingPercentage / 100);
          }
          paternalPoolShare = remainingPercentage - maternalPoolShare;
        } else if (paternalBranches.length > 0) {
          paternalPoolShare = remainingPercentage;
        } else {
          maternalPoolShare = remainingPercentage;
        }

        const paternalUnitsTotal = paternalBranches.reduce((s, b) => s + b.units, 0);
        const maternalUnitsTotal = maternalBranches.reduce((s, b) => s + b.units, 0);

        virtualParentPool.forEach(p => {
          let parentShare = 0;
          if (p.side === 'maternal') {
            parentShare = (p.units / maternalUnitsTotal) * maternalPoolShare;
          } else {
            parentShare = (p.units / paternalUnitsTotal) * paternalPoolShare;
          }
          const group = virtualParentMap.get(p.key)!;
          const parentNameToShow = p.key.includes('::') ? p.key.split('::')[1] : (translations[language][p.key as keyof typeof translations.ar] || p.key);

          if (language === 'ar') {
            if (p.side === 'maternal') {
              let note = "";
              const maternalParentCount = maternalBranches.length;
              const groupHeirsCount = group.children.length;
              
              const isHeirMale = getGender(group.children[0].type) === 'male';
              const parentTitle = p.parentGender === 'male' ? 'الأخ لأم' : 'الأخت لأم';
              
              const parentNameTrimmed = parentNameToShow ? parentNameToShow.trim() : '';
              const isCustom = p.key !== 'brotherMaternal' && 
                               p.key !== 'sisterMaternal' && 
                               parentNameTrimmed !== 'brotherMaternal' && 
                               parentNameTrimmed !== 'sisterMaternal' &&
                               parentNameTrimmed !== 'الأخ لأم' &&
                               parentNameTrimmed !== 'الأخت لأم' &&
                               parentNameTrimmed !== 'Unknown' &&
                               parentNameTrimmed !== 'مجهول' &&
                               parentNameTrimmed !== '';
              const parentDisplayName = isCustom ? parentNameTrimmed : (maternalParentCount >= 3 ? 'الإخوة والأخوات لأم' : parentTitle);
              const kalalaText = isCustom ? (p.parentGender === 'male' ? 'لأنه كلالة' : 'لأنها كلالة') : (maternalParentCount >= 3 ? 'لأنهم كلالة' : (p.parentGender === 'male' ? 'لأنه كلالة' : 'لأنها كلالة'));
              
              const heirTarget = isCustom ? (p.parentGender === 'male' ? (isHeirMale ? 'لأبنه' : 'لبنته') : (isHeirMale ? 'لأبنها' : 'لبنتها')) : (maternalParentCount >= 3 ? 'لأبنائهم' : (p.parentGender === 'male' ? (isHeirMale ? 'لأبنه' : 'لبنته') : (isHeirMale ? 'لأبنها' : 'لبنتها')));
              const pluralRef = isCustom ? (p.parentGender === 'male' ? 'لأبنائه' : 'لأبنائها') : (maternalParentCount >= 3 ? 'لأبنائهم' : (p.parentGender === 'male' ? 'لأبنائه' : 'لأبنائها'));
              
              const hasPaternal = paternalBranches.length > 0;
              
              if (!hasPaternal) {
                if (maternalParentCount === 1) {
                  if (groupHeirsCount === 1) {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${heirTarget} والباقي يرد عليهم حسب سهامهم`;
                  } else {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${pluralRef} بالسوية والباقي يرد عليهم حسب سهامهم`;
                  }
                } else if (maternalParentCount === 2) {
                  if (groupHeirsCount === 1) {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${heirTarget} والباقي يرد عليهم حسب سهامهم`;
                  } else {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${pluralRef} بالسوية والباقي يرد عليهم حسب سهامهم`;
                  }
                } else {
                  // 3 or more parents
                  const fractionNames: Record<number, string> = {
                    3: "ثلث الثلث",
                    4: "ربع الثلث",
                    5: "خمس الثلث",
                    6: "سدس الثلث",
                    7: "سبع الثلث",
                    8: "ثمن الثلث",
                    9: "تسع الثلث",
                    10: "عشر الثلث",
                  };
                  const shareFractionPrefix = fractionNames[maternalParentCount] || `جزء من ${maternalParentCount} من الثلث`;
                  if (groupHeirsCount === 1) {
                    note = `${shareFractionPrefix} نصيب ${parentDisplayName} ${kalalaText} يذهب ${heirTarget} والباقي يرد عليهم حسب سهامهم`;
                  } else {
                    note = `${shareFractionPrefix} نصيب ${parentDisplayName} ${kalalaText} يذهب ${pluralRef} بالسوية والباقي يرد عليهم حسب سهامهم`;
                  }
                }
              } else {
                if (maternalParentCount === 1) {
                  if (groupHeirsCount === 1) {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${heirTarget}`;
                  } else {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${pluralRef} بالسوية`;
                  }
                } else if (maternalParentCount === 2) {
                  if (groupHeirsCount === 1) {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${heirTarget}`;
                  } else {
                    note = `السدس نصيب ${parentDisplayName} ${kalalaText} يذهب ${pluralRef} بالسوية`;
                  }
                } else {
                  // 3 or more parents
                  const fractionNames: Record<number, string> = {
                    3: "ثلث الثلث",
                    4: "ربع الثلث",
                    5: "خمس الثلث",
                    6: "سدس الثلث",
                    7: "سبع الثلث",
                    8: "ثمن الثلث",
                    9: "تسع الثلث",
                    10: "عشر الثلث",
                  };
                  const shareFractionPrefix = fractionNames[maternalParentCount] || `جزء من ${maternalParentCount} من الثلث`;
                  if (groupHeirsCount === 1) {
                    note = `${shareFractionPrefix} نصيب ${parentDisplayName} ${kalalaText} يذهب ${heirTarget}`;
                  } else {
                    note = `${shareFractionPrefix} نصيب ${parentDisplayName} ${kalalaText} يذهب ${pluralRef} بالسوية`;
                  }
                }
              }
              
              group.children.forEach(child => {
                shareMap[child.id] = { note, percentage: parentShare / group.children.length };
              });
            } else {
              let note = "";
              const paternalParentCount = paternalBranches.length;
              const groupHeirsCount = group.children.length;
              const hasMixed = group.children.some(c => getGender(c.type) === 'male') && group.children.some(c => getGender(c.type) === 'female');
              const isSisterGroup = p.parentGender === 'female' || p.side === 'maternal' || p.key.startsWith('sister') || group.children.some(c => c.type.startsWith('sister') || c.type.includes('Maternal'));

              const hasOneMaleBranch = paternalBranches.filter(b => b.parentGender === 'male').length === 1;
              const hasOneFemaleBranch = paternalBranches.filter(b => b.parentGender === 'female').length === 1;
              const isTriadPaternal = paternalParentCount === 2 && hasOneMaleBranch && hasOneFemaleBranch && maternalBranches.length === 1;
              const isQuadPaternal = paternalParentCount === 2 && hasOneMaleBranch && hasOneFemaleBranch && 
                                     (maternalBranches.length === 2 || (maternalBranches.length === 1 && activeNephewsNieces.some(n => n.type.includes('brotherSonMaternal')) && activeNephewsNieces.some(n => n.type.includes('sisterSonMaternal'))));
              
              const hasMaternalBrotherBranch = maternalBranches.some(b => b.parentGender === 'male');
              const hasMaternalSisterBranch = maternalBranches.some(b => b.parentGender === 'female');
              
              const hasMaternalBrotherType = activeNephewsNieces.some(n => n.type.includes('brotherSonMaternal') || n.type.includes('brotherDaughterMaternal'));
              const hasMaternalSisterType = activeNephewsNieces.some(n => n.type.includes('sisterSonMaternal') || n.type.includes('sisterDaughterMaternal'));
              const isDuoBrotherMaternalPaternal = paternalParentCount === 1 && hasOneMaleBranch && maternalBranches.length === 1 && hasMaternalBrotherBranch;
              const isSpecialTriadPaternal = paternalParentCount === 1 && hasOneMaleBranch && 
                                             ((maternalBranches.length === 2 && hasMaternalBrotherBranch && hasMaternalSisterBranch) || 
                                              (maternalBranches.length === 1 && hasMaternalBrotherType && hasMaternalSisterType));

              const totalParentUnits = paternalBranches.reduce((sum, b) => sum + (b.parentGender === 'male' ? 2 : 1), 0);

              const isBrotherBranchSingleWithMaternal = paternalParentCount === 1 && hasOneMaleBranch && maternalBranches.length === 1;
              const allPaternalAreMaleBrotherBranches = paternalBranches.length >= 2 && paternalBranches.every(b => b.parentGender === 'male');
              const isMultiBrotherBranchesWithMaternal = allPaternalAreMaleBrotherBranches && maternalBranches.length >= 1;

              if (isMultiBrotherBranchesWithMaternal) {
                const N = paternalBranches.length;
                const fracText = N === 2 ? 'نصف' : N === 3 ? 'ثلث' : N === 4 ? 'ربع' : N === 5 ? 'خمس' : N === 6 ? 'سدس' : `1/${N}`;
                note = `${fracText} الباقي يذهب الى ابناء ${parentNameToShow}`;
                if (group.children.length > 1) {
                  if (hasMixed && !isSisterGroup) note += ` للذكر مثل حظ الانثيين`;
                  else note += ` بالسوية`;
                }
              } else if (isBrotherBranchSingleWithMaternal) {
                if (groupHeirsCount === 1) {
                  note = "يحوز الباقي";
                } else if (hasMixed && !isSisterGroup) {
                  note = "يحوز الباقي يكون للذكر مثل حظ الاثنيين";
                } else {
                  note = "يحوز الباقي يقسم على أبناء الأخ بالسوية";
                }
              } else if (isDuoBrotherMaternalPaternal || isSpecialTriadPaternal) {
                note = "يحوز الباقي";
              } else if (paternalParentCount === 1) {
                const parentTitleFull = p.parentGender === 'male' ? 'الأخ' : 'الأخت';
                note = `يحوز الباقي يقسم على أبناء ${parentTitleFull} بالسوية`;
                if (groupHeirsCount >= 3 && !hasMixed) note = `يحوز الباقي يقسم عليهم الباقي بالسوية`;
                if (hasMixed) {
                  if (p.parentGender === 'female') {
                    note = `يحوز الباقي يقسم بينهم بالسوية`;
                  } else {
                    note = `يحوز الباقي يكون للذكر مثل حظ الاثنيين`;
                  }
                }
              } else if (isTriadPaternal || isQuadPaternal) {
                note = isSisterGroup ? "الباقي يقسم بينهم بالسوية" : "الباقي للذكر مثل حظ الانثيين";
              } else {
                const numbersArabic: Record<number, string> = {
                  2: 'سهمين', 3: 'ثلاثة أسهم', 4: 'أربعة أسهم', 5: 'خمسة أسهم', 6: 'ستة أسهم',
                  7: 'سبعة أسهم', 8: 'ثمانية أسهم', 9: 'تسعة أسهم', 10: 'عشرة أسهم',
                  11: 'أحد عشر سهماً', 12: 'اثني عشر سهماً', 13: 'ثلاثة عشر سهماً', 14: 'أربعة عشر سهماً',
                  15: 'خمسة عشر سهماً', 16: 'ستة عشر سهماً', 17: 'سبعة عشر سهماً', 18: 'ثمانية عشر سهماً',
                  19: 'تسعة عشر سهماً', 20: 'عشرين سهماً', 21: 'واحد وعشرين سهماً', 22: 'اثنين وعشرين سهماً',
                  23: 'ثلاثة وعشرين سهماً', 24: 'أربعة وعشرين سهماً', 25: 'خمسة وعشرين سهماً',
                  26: 'ستة وعشرين سهماً', 27: 'سبعة وعشرين سهماً', 28: 'ثمانية وعشرين سهماً',
                  29: 'تسعة وعشرين سهماً', 30: 'ثلاثين سهماً'
                };
                const totalSharesLabel = numbersArabic[totalParentUnits] || `${totalParentUnits} اسهم`;
                const parentShareUnits = p.parentGender === 'male' ? 2 : 1;
                const parentShareLabel = parentShareUnits === 2 ? 'سهمان' : 'سهم';
                
                let heirsRef = "";
                let subNote = "";
                if (group.children.length > 1) {
                  heirsRef = `لأبناء ${parentNameToShow}`;
                  const internalMethod = (hasMixed && !isSisterGroup) ? "للذكر مثل حظ الانثيين" : "بالسوية";
                  const shareValue = parentShareUnits / group.children.length;
                  
                  if (shareValue === 1 && !hasMixed) {
                    subNote = ` كل واحد منهم سهم`;
                  } else {
                    subNote = ` يقسم بينهم ${internalMethod}`;
                  }
                } else {
                  const isHeirMale = getGender(group.children[0].type) === 'male';
                  const refTarget = p.parentGender === 'male' ? (isHeirMale ? 'لإبن' : 'لبنت') : (isHeirMale ? 'لإبن' : 'لبنت');
                  heirsRef = `${refTarget} ${parentNameToShow}`;
                }

                note = `المال على ${totalSharesLabel} ${parentShareLabel} ${heirsRef}${subNote}`;

                const hasOnlyPaternalBrotherBranch = paternalBranches.length === 2 && 
                                                    paternalBranches.some(b => b.parentGender === 'male') && 
                                                    paternalBranches.some(b => b.parentGender === 'female');
                
                if (hasOnlyPaternalBrotherBranch) {
                   const isMaleChild = getGender(group.children[0].type) === 'male';
                   
                   if (p.parentGender === 'male') {
                     if (group.children.length === 1) {
                       const targetRef = isMaleChild ? 'لإبنه' : 'لبنته';
                       note = `الثلثان نصيب ${parentNameToShow} يذهب ${targetRef}`;
                     } else {
                       const internalMethod = hasMixed ? "للذكر مثل حظ الانثيين" : "بالسوية";
                       note = `الثلثان نصيب ${parentNameToShow} يقسم على أبنائه ${internalMethod}`;
                     }
                   } else {
                     if (group.children.length === 1) {
                       const targetRef = isMaleChild ? 'لإبنها' : 'لبنتها';
                       note = `الثلث نصيب ${parentNameToShow} يذهب ${targetRef}`;
                     } else {
                       note = `الثلث نصيب ${parentNameToShow} يقسم على أبنائها بالسوية`;
                     }
                   }
                } else {
                  if (group.children.length >= 3 && !hasMixed && !subNote) note += ` يقسم عليهم بالسوية`;
                  if (hasMixed && !subNote) {
                    if (isSisterGroup) {
                      note += ` يقسم بينهم بالسوية`;
                    } else {
                      note += ` يكون للذكر مثل حظ الاثنيين`;
                    }
                  }
                }
              }

              const allPaternalAreSisters = paternalBranches.every(b => b.parentGender === 'female');
              if (allPaternalAreSisters && paternalParentCount >= 2) {
                const fractionSisters: Record<number, string> = {
                  2: 'نصف', 3: 'ثلث', 4: 'ربع', 5: 'خمس', 6: 'سدس', 7: 'سبع'
                };
                const fracS = fractionSisters[paternalParentCount] ? `${fractionSisters[paternalParentCount]} الثلثين` : `1/${paternalParentCount} الثلثين`;
                const parentTitlePaternal = p.side === 'paternal' ? 'الأخت لأب' : 'الأخت';
                
                if (groupHeirsCount === 1) {
                  const isHeirMale = getGender(group.children[0].type) === 'male';
                  const heirTargetRef = isHeirMale ? 'لإبنها' : 'لبنتها';
                  note = `${fracS} نصيب ${parentTitlePaternal} ${parentNameToShow} والباقي رحماً حسب سهامهم يذهب ${heirTargetRef}`;
                } else {
                  note = `${fracS} نصيب ${parentTitlePaternal} ${parentNameToShow} والباقي رحماً حسب سهامهم يذهب لأبنائها بالتساوي`;
                }
              }

              if (paternalParentCount === 1 && maternalBranches.length === 1 && p.parentGender === 'female') {
                const isHeirMale = getGender(group.children[0].type) === 'male';
                const label = isHeirMale ? "يأخذ" : "تأخذ";
                note = `${label} النصف نصيب الأخت والباقي رحماً حسب سهامهم`;
              }

              const internalUnits = (hasMixed && !isSisterGroup) ? group.children.reduce((s, c) => s + (getGender(c.type) === 'male' ? 2 : 1), 0) : group.children.length;
              const perInternalUnit = parentShare / internalUnits;

              group.children.forEach(child => {
                const u = (hasMixed && !isSisterGroup) ? (getGender(child.type) === 'male' ? 2 : 1) : 1;
                shareMap[child.id] = { note, percentage: perInternalUnit * u };
              });
            }
          } else {
            const trans = translations[language];
            const getSharesLabel = (count: number) => {
              if (count === 1) return trans.shares1;
              if (count === 2) return trans.shares2;
              return trans.sharesPlural.replace('{n}', count.toString());
            };
            const getParentSharesLabel = (count: number) => {
              if (count === 1) return trans.shareSingular;
              if (count === 2) return trans.shares2;
              return trans.sharesPlural.replace('{n}', count.toString());
            };
            const totalBranchUnits = p.side === 'maternal' ? maternalUnitsTotal : paternalUnitsTotal;
            const gcdH = (a: number, b: number): number => a ? gcdH(b % a, a) : b;
            const common = gcdH(p.units, totalBranchUnits);
            const num = p.units / common;
            const den = totalBranchUnits / common;
            const totalSharesLabel = getSharesLabel(den);
            const parentSharesLabel = getParentSharesLabel(num);
            const parentGenderVerb = p.parentGender === 'male' ? trans.verbMale : trans.verbFemale;
            const onLabel = language === 'ur' ? 'پر' : 'on';

            if (group.children.length === 1) {
              const child = group.children[0];
              const isMaleChild = getGender(child.type) === 'male';
              let actualTarget = '';
              if (p.parentGender === 'male') {
                actualTarget = isMaleChild ? trans.sonRef : trans.daughterRef;
              } else {
                actualTarget = isMaleChild ? trans.maternalSonRef : trans.maternalDaughterRef;
              }
              const note = `${trans.remainderLabel} ${onLabel} ${totalSharesLabel} ${parentGenderVerb} (${parentNameToShow}) ${onLabel} ${parentSharesLabel} ${trans.connectorBranch} ${actualTarget}`;
              shareMap[child.id] = { note, percentage: parentShare };
            } else {
              const childRef = p.parentGender === 'male' ? trans.sonDaughterRef : trans.maternalSonDaughterRef;
              const rule = (p.side === 'maternal' || p.parentGender === 'female') ? trans.ruleEqual : trans.ruleMaleDouble;
              const note = `${trans.remainderLabel} ${onLabel} ${totalSharesLabel} ${parentGenderVerb} (${parentNameToShow}) ${onLabel} ${parentSharesLabel} ${trans.connectorBranch} ${childRef} ${rule}`;
              const intUnits = p.side === 'maternal' || p.parentGender === 'female' ? group.children.length : group.children.reduce((s, c) => s + (getGender(c.type) === 'male' ? 2 : 1), 0);
              const perIntUnit = parentShare / intUnits;
              group.children.forEach(child => {
                const u = p.side === 'maternal' || p.parentGender === 'female' ? 1 : (getGender(child.type) === 'male' ? 2 : 1);
                shareMap[child.id] = { note, percentage: perIntUnit * u };
              });
            }
          }
        });
        remainingPercentage = 0;
      }

    }
  }

  if (remainingPercentage > 0) {
    const activePaternalUnclesAunts = heirDetails.filter(h =>
      paternalSideUncleAuntTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );
    const activeMaternalUnclesAunts = heirDetails.filter(h =>
      maternalSideUncleAuntTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );
    
    const hasPaternalUA = activePaternalUnclesAunts.length > 0;
    const hasMaternalUA = activeMaternalUnclesAunts.length > 0;
    
    const activeGrandmothersHere = heirDetails.filter(h =>
      grandmotherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
    );
    const hasActiveGMPaternal = activeGrandmothersHere.some(h => h.type === 'grandmotherPaternal');
    const hasActiveGMMaternal = activeGrandmothersHere.some(h => h.type === 'grandmotherMaternal');
    
    const activeGrandfathersHere = heirDetails.filter(h =>
      grandfatherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked && !shareMap[h.id]
    );
    const hasActiveGFPaternal = activeGrandfathersHere.some(h => h.type === 'grandfatherPaternal');
    const hasActiveGFMaternal = activeGrandfathersHere.some(h => h.type === 'grandfatherMaternal');
    const hasActiveGPHere = activeGrandfathersHere.length > 0 || activeGrandmothersHere.length > 0;
    
    if (hasPaternalUA || hasMaternalUA) {
      const isAuntCombined = (activePaternalUnclesAunts.length === 2 && 
                              activePaternalUnclesAunts.some(h => h.type === 'auntPaternal') && 
                              activePaternalUnclesAunts.some(h => h.type === 'auntPaternalMaternal'));

      const hasGrandparentsHere = hasActiveGPHere;
      const uncleAuntAlone = activeSpouses.length === 0 && !hasGrandparentsHere;
      
      const gmInGroups = unclesAreMainHeirs && hasGrandparentsHere;
      
      const hasSpouseShareInUncle = activeSpouses.some(s => shareMap[s.id] && shareMap[s.id].percentage > 0);

      if (hasPaternalUA && hasMaternalUA) {
        const totalPool = remainingPercentage + (gmInGroups ? grandmotherShareTotal : 0);
        
        const hasUncleP = activePaternalUnclesAunts.some(h => h.type === 'unclePaternal');
        const hasAuntP = activePaternalUnclesAunts.some(h => h.type === 'auntPaternal');
        const hasUncleM = activeMaternalUnclesAunts.some(h => h.type === 'uncleMaternal');
        const hasAuntM = activeMaternalUnclesAunts.some(h => h.type === 'auntMaternal');
        
        const isSixTogether = gmInGroups && hasUncleP && hasAuntP && hasUncleM && hasAuntM && hasActiveGMPaternal && hasActiveGMMaternal;

        const paternalPool = totalPool * 2 / 3;
        const maternalPool = totalPool / 3;
        
        const paternalSidePaternalGroup: { id: string; isMale: boolean; isGP: boolean }[] = [];
        const paternalSideMaternalGroup: { id: string; isMale: boolean; isGP: boolean }[] = [];

        activePaternalUnclesAunts.forEach(h => {
          const isMaternalSideOfPaternal = h.type === 'unclePaternalMaternal' || h.type === 'auntPaternalMaternal';
          if (isMaternalSideOfPaternal) {
            paternalSideMaternalGroup.push({ id: h.id, isMale: getGender(h.type) === 'male', isGP: false });
          } else {
            paternalSidePaternalGroup.push({ id: h.id, isMale: getGender(h.type) === 'male', isGP: false });
          }
        });

        if (gmInGroups && hasActiveGFPaternal) {
          const gfPat = activeGrandfathersHere.find(h => h.type === 'grandfatherPaternal');
          if (gfPat) paternalSidePaternalGroup.push({ id: gfPat.id, isMale: true, isGP: true });
        }
        if (gmInGroups && hasActiveGMPaternal) {
          const gmPat = activeGrandmothersHere.find(h => h.type === 'grandmotherPaternal');
          if (gmPat) paternalSidePaternalGroup.push({ id: gmPat.id, isMale: false, isGP: true });
        }

        if (paternalSidePaternalGroup.length > 0 && paternalSideMaternalGroup.length > 0) {
          const subPaternalPool = paternalPool * 2 / 3;
          const subMaternalPool = paternalPool / 3;

          let subPatUnits = 0;
          paternalSidePaternalGroup.forEach(m => { subPatUnits += m.isMale ? 2 : 1; });
          const perSubPatUnit = subPaternalPool / subPatUnits;
          paternalSidePaternalGroup.forEach(m => {
            const u = m.isMale ? 2 : 1;
            let note = language === 'ar' ? "الثلثين نصيب الأب للذكر مثل حظ الانثيين" : t('noteUncleAuntTwoThirds');
            if (isAuntCombined) note = t('noteAuntsPaternalCombined');
            shareMap[m.id] = { note, percentage: perSubPatUnit * u };
          });

          const perSubMat = subMaternalPool / paternalSideMaternalGroup.length;
          paternalSideMaternalGroup.forEach(m => {
            let note = language === 'ar' ? "الثلثين نصيب الأب للذكر مثل حظ الانثيين" : (paternalSideMaternalGroup.length > 1 ? t('noteUncleAuntPaternalMaternalGroup') : t('noteUncleAuntTwoThirds'));
            if (isAuntCombined) note = t('noteAuntsPaternalCombined');
            shareMap[m.id] = { note, percentage: perSubMat };
          });
        } else {
          const combinedPaternalMembers = [...paternalSidePaternalGroup, ...paternalSideMaternalGroup];
          let totalBranchUnits = 0;
          combinedPaternalMembers.forEach(m => { totalBranchUnits += m.isMale ? 2 : 1; });
          const perUnit = paternalPool / totalBranchUnits;
          const hasGPInPatGroup = combinedPaternalMembers.some(pm => pm.isGP);
          combinedPaternalMembers.forEach(m => {
            const u = m.isMale ? 2 : 1;
            let note: string;
            if (isSixTogether) {
              note = t('noteSixHeirsPaternal');
            } else if (hasGPInPatGroup) {
              note = t('noteAllPaternalGroupMaleDouble');
            } else {
              const hasMultiplePaternal = activePaternalUnclesAunts.length > 1;
              if (hasMultiplePaternal) {
                note = t('noteUncleAuntPaternalSide');
              } else {
                note = t('noteUncleAuntTwoThirds');
              }
            }
            shareMap[m.id] = { note, percentage: perUnit * u };
          });
        }
        
        const maternalMembers: { id: string; isGP: boolean; type: string }[] = [];
        activeMaternalUnclesAunts.forEach(h => {
          maternalMembers.push({ id: h.id, isGP: false, type: h.type });
        });
        if (gmInGroups && hasActiveGFMaternal) {
          const gfMat = activeGrandfathersHere.find(h => h.type === 'grandfatherMaternal');
          if (gfMat) maternalMembers.push({ id: gfMat.id, isGP: true, type: 'grandfatherMaternal' });
        }
        if (gmInGroups && hasActiveGMMaternal) {
          const gmMat = activeGrandmothersHere.find(h => h.type === 'grandmotherMaternal');
          if (gmMat) maternalMembers.push({ id: gmMat.id, isGP: true, type: 'grandmotherMaternal' });
        }
        
        const perMaternal = maternalPool / maternalMembers.length;
        const hasGPInMatGroup = maternalMembers.some(mm => mm.isGP);
        
        const hasFullKhal = maternalMembers.some(m => m.type === 'uncleMaternal' || m.type === 'auntMaternal');
        const hasKhalOfMother = maternalMembers.some(m => m.type === 'uncleMaternalMaternal' || m.type === 'auntMaternalMaternal');

        maternalMembers.forEach(m => {
          let note: string;
          if (isSixTogether) {
            note = t('noteSixHeirsMaternal');
          } else if (hasGPInMatGroup && maternalMembers.length > 1) {
            note = t('noteAllMaternalGroupEqual');
          } else if (m.isGP) {
            note = t('noteGFMaternalWithUncle');
          } else if (hasFullKhal && hasKhalOfMother) {
            note = language === 'ar' ? "الثلث نصيب الأم للذكر والانثى سواء يذهب الى الخال والخال لأم" : t('noteUncleAuntMaternalSide');
          } else {
            const hasMultipleMaternal = activeMaternalUnclesAunts.length > 1;
            const hasMultiplePaternal = activePaternalUnclesAunts.length > 1;
            if (hasMultipleMaternal && hasMultiplePaternal) {
              note = t('noteUncleAuntMaternalSide');
            } else {
              note = t('noteUncleAuntMaternalConcise');
            }
          }
          shareMap[m.id] = { note, percentage: perMaternal };
        });
        
        remainingPercentage = 0;
      } else if (hasPaternalUA && !hasMaternalUA) {
        const totalPool = remainingPercentage + (gmInGroups ? grandmotherShareTotal : 0);
        
        const paternalSidePaternalGroup: { id: string; isMale: boolean; isGP: boolean }[] = [];
        const paternalSideMaternalGroup: { id: string; isMale: boolean; isGP: boolean }[] = [];

        activePaternalUnclesAunts.forEach(h => {
          const isMaternalSideOfPaternal = h.type === 'unclePaternalMaternal' || h.type === 'auntPaternalMaternal';
          if (isMaternalSideOfPaternal) {
            paternalSideMaternalGroup.push({ id: h.id, isMale: getGender(h.type) === 'male', isGP: false });
          } else {
            paternalSidePaternalGroup.push({ id: h.id, isMale: getGender(h.type) === 'male', isGP: false });
          }
        });

        if (gmInGroups && hasActiveGFPaternal) {
          const gfPat = activeGrandfathersHere.find(h => h.type === 'grandfatherPaternal');
          if (gfPat) paternalSidePaternalGroup.push({ id: gfPat.id, isMale: true, isGP: true });
        }
        if (gmInGroups && hasActiveGMPaternal) {
          const gmPat = activeGrandmothersHere.find(h => h.type === 'grandmotherPaternal');
          if (gmPat) paternalSidePaternalGroup.push({ id: gmPat.id, isMale: false, isGP: true });
        }
        
        const hasMaternalGP = (gmInGroups && hasActiveGFMaternal) || (gmInGroups && hasActiveGMMaternal);
        
        if (hasMaternalGP) {
          const maternalPool = totalPool / 3;
          const paternalPool = totalPool * 2 / 3;
          
          const maternalGPMembers: { id: string }[] = [];
          if (hasActiveGFMaternal) {
            const gfMat = activeGrandfathersHere.find(h => h.type === 'grandfatherMaternal');
            if (gfMat) maternalGPMembers.push({ id: gfMat.id });
          }
          if (hasActiveGMMaternal) {
            const gmMat = activeGrandmothersHere.find(h => h.type === 'grandmotherMaternal');
            if (gmMat) maternalGPMembers.push({ id: gmMat.id });
          }
          
          const perMaternalGP = maternalPool / maternalGPMembers.length;
          maternalGPMembers.forEach(m => {
            shareMap[m.id] = { note: t('noteGFMaternalWithUncle'), percentage: perMaternalGP };
          });
          
          if (paternalSidePaternalGroup.length > 0 && paternalSideMaternalGroup.length > 0) {
            const subPaternalPool = paternalPool * 2 / 3;
            const subMaternalPool = paternalPool / 3;

            let subPatUnits = 0;
            paternalSidePaternalGroup.forEach(m => { subPatUnits += m.isMale ? 2 : 1; });
            const perSubPatUnit = subPaternalPool / subPatUnits;
            paternalSidePaternalGroup.forEach(m => {
              const u = m.isMale ? 2 : 1;
              let note = t('noteUncleAuntTwoThirds');
              if (isAuntCombined) note = t('noteAuntsPaternalCombined');
              shareMap[m.id] = { note, percentage: perSubPatUnit * u };
            });

            const perSubMat = subMaternalPool / paternalSideMaternalGroup.length;
            paternalSideMaternalGroup.forEach(m => {
              let note = paternalSideMaternalGroup.length > 1 ? t('noteUncleAuntPaternalMaternalGroup') : t('noteUncleAuntMaternalSide');
              if (isAuntCombined) note = t('noteAuntsPaternalCombined');
              shareMap[m.id] = { note, percentage: perSubMat };
            });
          } else {
            const combinedPaternalMembers = [...paternalSidePaternalGroup, ...paternalSideMaternalGroup];
            let paternalUnits = 0;
            combinedPaternalMembers.forEach(m => { paternalUnits += m.isMale ? 2 : 1; });
            const perPaternalUnit = paternalPool / paternalUnits;
            combinedPaternalMembers.forEach(m => {
              const units = m.isMale ? 2 : 1;
              const note = combinedPaternalMembers.length === 1 ? t('noteUncleAuntTwoThirds') : t('noteUncleAuntPaternalWithGMM');
              shareMap[m.id] = { note, percentage: perPaternalUnit * units };
            });
          }
          remainingPercentage = 0;
        } else {
           if (paternalSidePaternalGroup.length > 0 && paternalSideMaternalGroup.length > 0) {
             const subPaternalPool = totalPool * 2 / 3;
             const subMaternalPool = totalPool / 3;

             let subPatUnits = 0;
             paternalSidePaternalGroup.forEach(m => { subPatUnits += m.isMale ? 2 : 1; });
             const perSubPatUnit = subPaternalPool / subPatUnits;
             paternalSidePaternalGroup.forEach(m => {
               const u = m.isMale ? 2 : 1;
               let note = t('noteUncleAuntTwoThirds');
               if (isAuntCombined) note = t('noteAuntsPaternalCombined');
               shareMap[m.id] = { note, percentage: perSubPatUnit * u };
             });

             const perSubMat = subMaternalPool / paternalSideMaternalGroup.length;
             paternalSideMaternalGroup.forEach(m => {
               let note = paternalSideMaternalGroup.length > 1 ? t('noteUncleAuntPaternalMaternalGroup') : t('noteUncleAuntMaternalSide');
               if (isAuntCombined) note = t('noteAuntsPaternalCombined');
               shareMap[m.id] = { note, percentage: perSubMat };
             });
           } else {
             const combinedPaternalMembers = [...paternalSidePaternalGroup, ...paternalSideMaternalGroup];
             let paternalUnits = 0;
             combinedPaternalMembers.forEach(m => { paternalUnits += m.isMale ? 2 : 1; });
             const perPaternalUnit = totalPool / paternalUnits;
             const hasGPInGroup = combinedPaternalMembers.some(pm => pm.isGP);
              combinedPaternalMembers.forEach(m => {
                const units = m.isMale ? 2 : 1;
                let note: string;
                if (hasSpouseShareInUncle) {
                  note = t('noteUncleWithSpouse');
                } else if (hasGPInGroup) {
                  note = t('noteAllPaternalGroupMaleDouble');
                } else if (hasActiveGMMaternal) {
                  note = combinedPaternalMembers.length === 1 ? t('noteUncleAuntTwoThirds') : t('noteUncleAuntPaternalWithGMM');
                } else if (combinedPaternalMembers.filter(pm => !pm.isGP).length === 1) {
                  note = t('noteUnclePaternalSingleAlone');
                } else {
                  const isMaternalSideOfPaternal = m.id.startsWith('unclePaternalMaternal') || m.id.startsWith('auntPaternalMaternal');
                  if (isMaternalSideOfPaternal && paternalSideMaternalGroup.length > 1) {
                    note = t('noteUncleAuntPaternalMaternalGroup');
                  } else {
                    note = t('noteUncleAuntPaternalAlone');
                  }
                }
                shareMap[m.id] = { note, percentage: perPaternalUnit * units };
              });
           }
           remainingPercentage = 0;
         }
      } else if (hasMaternalUA && !hasPaternalUA) {
        const totalPool = remainingPercentage + (gmInGroups ? grandmotherShareTotal : 0);
        
        const maternalUncleAuntMembers: { id: string }[] = [];
        activeMaternalUnclesAunts.forEach(h => {
          maternalUncleAuntMembers.push({ id: h.id });
        });
        
        const hasPaternalGP = (gmInGroups && hasActiveGFPaternal) || (gmInGroups && hasActiveGMPaternal);
        
        if (hasPaternalGP || (gmInGroups && hasActiveGMPaternal) || (gmInGroups && hasActiveGFPaternal)) {
          const paternalPool = totalPool * 2 / 3;
          const maternalPool = totalPool / 3;
          
          const paternalGPMembers: { id: string; isMale: boolean }[] = [];
          if (hasActiveGFPaternal) {
            const gfPat = activeGrandfathersHere.find(h => h.type === 'grandfatherPaternal');
            if (gfPat) paternalGPMembers.push({ id: gfPat.id, isMale: true });
          }
          if (hasActiveGMPaternal) {
            const gmPat = activeGrandmothersHere.find(h => h.type === 'grandmotherPaternal');
            if (gmPat) paternalGPMembers.push({ id: gmPat.id, isMale: false });
          }
          
          let patUnits = 0;
          paternalGPMembers.forEach(m => { patUnits += m.isMale ? 2 : 1; });
          const perPatUnit = paternalPool / patUnits;
          paternalGPMembers.forEach(m => {
            const units = m.isMale ? 2 : 1;
            let note = t('noteAllPaternalGroupMaleDouble');
            if (paternalGPMembers.length === 1 && !m.isMale && hasMaternalUA && !hasActiveGFPaternal && activePaternalUnclesAunts.length === 0) {
              note = t('noteGrandmotherPaternalWithUncle');
            } else if (paternalGPMembers.length === 1 && maternalUncleAuntMembers.length === 1) {
              note = m.isMale ? t('noteGrandfatherPaternalResiduary') : t('noteGrandmotherPaternalWithKhal');
            }
            shareMap[m.id] = { note, percentage: perPatUnit * units };
          });
          
          const maternalGroupMembers: { id: string; isGP: boolean }[] = [];
          maternalUncleAuntMembers.forEach(m => {
            maternalGroupMembers.push({ id: m.id, isGP: false });
          });
          if (hasActiveGFMaternal) {
            const gfMat = activeGrandfathersHere.find(h => h.type === 'grandfatherMaternal');
            if (gfMat) maternalGroupMembers.push({ id: gfMat.id, isGP: true });
          }
          if (hasActiveGMMaternal) {
            const gmMat = activeGrandmothersHere.find(h => h.type === 'grandmotherMaternal');
            if (gmMat) maternalGroupMembers.push({ id: gmMat.id, isGP: true });
          }
          
          const perMaternal = maternalPool / maternalGroupMembers.length;
          maternalGroupMembers.forEach(m => {
            let note = m.isGP ? t('noteGFMaternalWithUncle') : t('noteUncleAuntMaternalSide');
            if (!m.isGP && hasActiveGMPaternal && !hasActiveGFPaternal && activePaternalUnclesAunts.length === 0 && !hasActiveGFMaternal && !hasActiveGMMaternal) {
              note = maternalUncleAuntMembers.length > 1 ? t('noteKhalKhalaWithGrandmotherPaternal') : t('noteKhalWithGrandmotherPaternal');
            } else if (maternalGroupMembers.length === 1 && paternalGPMembers.length === 1 && !m.isGP) {
              note = t('noteKhalWithGrandmotherPaternal');
            }
            shareMap[m.id] = { note, percentage: perMaternal };
          });
          remainingPercentage = 0;
        } else if (gmInGroups && hasActiveGMMaternal && !hasActiveGFMaternal && !hasActiveGFPaternal && !hasActiveGMPaternal) {
          const gmMat = activeGrandmothersHere.find(h => h.type === 'grandmotherMaternal');
          if (gmMat) {
            const allMembers = [...maternalUncleAuntMembers, { id: gmMat.id }];
            const perMember = totalPool / allMembers.length;
            allMembers.forEach(m => {
              shareMap[m.id] = { note: t('noteKhalWithGrandmotherMaternal'), percentage: perMember };
            });
            remainingPercentage = 0;
          }
        } else if (gmInGroups && hasActiveGFMaternal && !hasActiveGFPaternal && !hasActiveGMPaternal && !hasActiveGMMaternal) {
          const gfMat = activeGrandfathersHere.find(h => h.type === 'grandfatherMaternal');
          if (gfMat) {
            const allMembers: { id: string; isGP: boolean }[] = [];
            maternalUncleAuntMembers.forEach(m => allMembers.push({ id: m.id, isGP: false }));
            allMembers.push({ id: gfMat.id, isGP: true });
            const perMember = totalPool / allMembers.length;
            allMembers.forEach(m => {
              const note = m.isGP ? t('noteGFMaternalWithUncle') : t('noteUncleAuntMaternalSide');
              shareMap[m.id] = { note, percentage: perMember };
            });
            remainingPercentage = 0;
          }
        } else {
          const perKhal = totalPool / maternalUncleAuntMembers.length;
          maternalUncleAuntMembers.forEach(m => {
            let note: string;
            if (hasSpouseShareInUncle) {
              note = t('noteUncleWithSpouse');
            } else if (uncleAuntAlone) {
              if (maternalUncleAuntMembers.length === 1) {
                note = t('noteUncleMaternalSingleAlone');
              } else {
                note = t('noteUncleAuntMaternalAlone');
              }
            } else {
              note = t('noteUncleAuntResiduary');
            }
            shareMap[m.id] = { note, percentage: perKhal };
          });
          remainingPercentage = 0;
        }
      }
    }
  }

  if (remainingPercentage > 0) {
    const activeCousins = heirDetails.filter(h =>
      cousinTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked
    );

    if (activeCousins.length > 0) {
      const paternalCousinTypes = [
        'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
        'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
        'auntPaternalSonMaternal', 'auntPaternalSonPaternal', 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal'
      ];
      const maternalCousinTypes = [
        'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
        'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
        'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
      ];

      const activePaternalCousins = activeCousins.filter(h => paternalCousinTypes.includes(h.type));
      const activeMaternalCousins = activeCousins.filter(h => maternalCousinTypes.includes(h.type));

      let paternalPool = 0;
      let maternalPool = 0;

      if (activePaternalCousins.length > 0 && activeMaternalCousins.length > 0) {
        // Paternal side gets 2/3 and maternal side gets 1/3
        paternalPool = (2 / 3) * remainingPercentage;
        maternalPool = (1 / 3) * remainingPercentage;
      } else if (activePaternalCousins.length > 0) {
        paternalPool = remainingPercentage;
      } else if (activeMaternalCousins.length > 0) {
        maternalPool = remainingPercentage;
      }

      // 1. Process Paternal Cousins
      if (paternalPool > 0 && activePaternalCousins.length > 0) {
        const virtualPaternalMap = new Map<string, { isPaternalUncle: boolean; children: HeirDetail[] }>();
        activePaternalCousins.forEach(pc => {
          const defaultParent = pc.type.includes('uncle') ? 'عم' : 'عمة';
          const parentNameStr = pc.parentName ? pc.parentName.trim() : '';
          const parentType = pc.type.includes('uncle') ? 'unclePaternal' : 'auntPaternal';
          const parentKey = parentNameStr ? `${parentType}::${parentNameStr}` : defaultParent;
          if (!virtualPaternalMap.has(parentKey)) {
            const isUncle = pc.type.includes('uncle');
            const isMaternalSide = pc.type.includes('Maternal');
            const isPaternalUncle = isUncle && !isMaternalSide;
            virtualPaternalMap.set(parentKey, { children: [], isPaternalUncle });
          }
          virtualPaternalMap.get(parentKey)!.children.push(pc);
        });

        let totalPaternalUnits = 0;
        virtualPaternalMap.forEach(group => {
          totalPaternalUnits += group.isPaternalUncle ? 2 : 1;
        });

        const perPaternalUnit = paternalPool / totalPaternalUnits;

        virtualPaternalMap.forEach((group, parentKey) => {
          const parentShare = perPaternalUnit * (group.isPaternalUncle ? 2 : 1);
          const actualParentKeyShow = parentKey.includes('::') ? parentKey.split('::')[1] : parentKey;
          
          if (!group.isPaternalUncle) {
            const sharePerChild = parentShare / group.children.length;
            group.children.forEach(child => {
              const note = language === 'ar' ? `نصيب من تقرب به (${actualParentKeyShow}) يوزع بالتساوي` : (language === 'ur' ? `(${actualParentKeyShow}) کا حصہ برابر تقسیم` : `Share of (${actualParentKeyShow}) distributed equally`);
              shareMap[child.id] = { note, percentage: sharePerChild };
            });
          } else {
            const internalUnits = group.children.reduce((s, c) => s + (getGender(c.type) === 'male' ? 2 : 1), 0);
            const perInternalUnit = parentShare / internalUnits;
            group.children.forEach(child => {
              const u = getGender(child.type) === 'male' ? 2 : 1;
              const note = language === 'ar' ? `نصيب من تقرب به (${actualParentKeyShow}) للذكر مثل حظ الأنثيين` : (language === 'ur' ? `(${actualParentKeyShow}) کا حصہ لڑکے کو لڑکی سے دوگنا تقسیم` : `Share of (${actualParentKeyShow}) distributed for male double of female`);
              shareMap[child.id] = { note, percentage: perInternalUnit * u };
            });
          }
        });
      }

      // 2. Process Maternal Cousins
      if (maternalPool > 0 && activeMaternalCousins.length > 0) {
        const virtualMaternalMap = new Map<string, { parentGender: 'male' | 'female'; children: HeirDetail[] }>();
        activeMaternalCousins.forEach(mc => {
          const defaultParent = mc.type.includes('uncle') ? 'خال' : 'خالة';
          const parentNameStr = mc.parentName ? mc.parentName.trim() : '';
          const parentType = mc.type.includes('uncle') ? 'uncleMaternal' : 'auntMaternal';
          const parentKey = parentNameStr ? `${parentType}::${parentNameStr}` : defaultParent;
          if (!virtualMaternalMap.has(parentKey)) {
            const parentGender: 'male' | 'female' = mc.type.includes('uncle') ? 'male' : 'female';
            virtualMaternalMap.set(parentKey, { children: [], parentGender });
          }
          virtualMaternalMap.get(parentKey)!.children.push(mc);
        });

        const totalMaternalUnits = virtualMaternalMap.size;
        const perMaternalUnit = maternalPool / totalMaternalUnits;

        virtualMaternalMap.forEach((group, parentKey) => {
          const parentShare = perMaternalUnit;
          const sharePerChild = parentShare / group.children.length;
          const actualParentKeyShow = parentKey.includes('::') ? parentKey.split('::')[1] : parentKey;
          group.children.forEach(child => {
            const note = language === 'ar' ? `نصيب من تقرب به (${actualParentKeyShow}) يوزع بالتساوي` : (language === 'ur' ? `(${actualParentKeyShow}) کا حصہ برابر تقسیم` : `Share of (${actualParentKeyShow}) distributed equally`);
            shareMap[child.id] = { note, percentage: sharePerChild };
          });
        });
      }

      remainingPercentage = 0;
    }
  }

  if (remainingPercentage > 0.01) {
    const activeNonSpouse = heirDetails.filter(h =>
      !spouseTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked && shareMap[h.id]
    );

    const motherHeir = heirDetails.find(h => h.type === 'mother' && !blockingResults[h.id]?.isBlocked);
    const activeGMs = heirDetails.filter(h => grandmotherTypes.includes(h.type) && !blockingResults[h.id]?.isBlocked);
    const otherActiveHeirs = heirDetails.filter(h => 
      !blockingResults[h.id]?.isBlocked && 
      h.type !== 'mother' && 
      !grandmotherTypes.includes(h.type) &&
      !spouseTypes.includes(h.type)
    );

    if (motherHeir && activeGMs.length > 0 && otherActiveHeirs.length === 0) {
      if (shareMap[motherHeir.id]) {
        shareMap[motherHeir.id].percentage += remainingPercentage;
        shareMap[motherHeir.id].note = t('noteMotherThirdWithSpouse');
        
        activeGMs.forEach(gm => {
          if (shareMap[gm.id]) {
            shareMap[gm.id].note = t('noteGrandmotherSixth');
          }
        });
        remainingPercentage = 0;
      }
    }

    if (remainingPercentage > 0.01 && activeNonSpouse.length > 0) {
      const totalNonSpouseShares = activeNonSpouse.reduce((sum, h) => sum + (shareMap[h.id]?.percentage || 0), 0);
      if (totalNonSpouseShares > 0) {
        activeNonSpouse.forEach(h => {
          const proportion = (shareMap[h.id]?.percentage || 0) / totalNonSpouseShares;
          shareMap[h.id].percentage += remainingPercentage * proportion;
        });
        remainingPercentage = 0;
      }
    }
  }

  const totalAssigned = Object.values(shareMap).reduce((sum, s) => sum + s.percentage, 0);
  if (totalAssigned > 100.01) {
    const factor = 100 / totalAssigned;
    Object.keys(shareMap).forEach(id => {
      shareMap[id].percentage *= factor;
    });
  }

  heirDetails.forEach((heir) => {
    const blocking = blockingResults[heir.id];
    const share = shareMap[heir.id];

    const typeBase = heir.id.split('-')[0];
    const idx = parseInt(heir.id.split('-')[1]);
    const totalOfThisType = heirDetails.filter(h => h.id.startsWith(`${typeBase}-`)).length;

    let relationshipLabel = getSingularName(heir.type, language);
    if (totalOfThisType > 1) {
      if (language === 'ar') {
        const isFemaleHeir = getGender(heir.type) === 'female';
        relationshipLabel = `${relationshipLabel} ${getArabicOrdinal(idx + 1, isFemaleHeir, language)}`;
      } else {
        relationshipLabel = `${relationshipLabel} ${idx + 1}`;
      }
    }

    results.push({
      blockedBy: blocking?.blockedBy,
      blockedByReligion: blocking?.blockedByReligion,
      blockedByParentsDual: blocking?.blockedByParentsDual,
      heir: relationshipLabel,
      heirName: heir.name,
      heirId: heir.id,
      heirType: heir.type,
      isBlocked: blocking?.isBlocked || false,
      note: blocking?.isBlocked ? '' : (share?.note || ''),
      percentage: blocking?.isBlocked ? 0 : (share?.percentage || 0),
    });
  });

  results.forEach(r => {
    r.percentage = Math.round(r.percentage * 100) / 100;
  });

  const activeResults = results.filter(r => !r.isBlocked && r.percentage > 0);
  const totalActivePercentage = activeResults.reduce((sum, r) => sum + r.percentage, 0);

  if (totalActivePercentage > 90 && Math.abs(totalActivePercentage - 100) > 0.001) {
    let largestIdx = -1;
    let maxVal = -1;
    results.forEach((r, idx) => {
      if (!r.isBlocked && r.percentage > maxVal) {
        maxVal = r.percentage;
        largestIdx = idx;
      }
    });
    if (largestIdx !== -1) {
      results[largestIdx].percentage = Math.round((results[largestIdx].percentage + (100 - totalActivePercentage)) * 100) / 100;
    }
  }

  const updatedActiveResults = results.filter(r => !r.isBlocked && r.percentage > 0);
  const finalTotalActivePercentage = updatedActiveResults.reduce((sum, r) => sum + r.percentage, 0);

  if (finalTotalActivePercentage > 99.99) {
    const uniqueActiveTypes = Array.from(new Set(updatedActiveResults.map(r => r.heirType)));
    
    if (uniqueActiveTypes.length === 1) {
      const type = uniqueActiveTypes[0];
      const count = updatedActiveResults.length;
      
      updatedActiveResults.forEach(r => {
        if (type === 'father' || type === 'son') {
          r.note = count === 1 ? t('noteFatherAll') : t('noteSonsResiduaryEqual');
        } else if (type === 'daughter') {
          if (count === 1) {
            r.note = t('daughterNoteHalfRahm'); 
          } else if (count === 2) {
            r.note = t('daughterNoteTwoThirdsRahm'); 
          } else {
            r.note = t('daughterNoteTwoThirdsRahmPlural'); 
          }
        } else if (type === 'mother') {
          r.note = language === 'ar' ? 'الثلث فرضاً والباقي رحماً' : (language === 'ur' ? 'تہائی فرض اور باقی رحم' : 'One-third fard and the rest radd');
        } else if (type === 'grandfatherPaternal' || type === 'grandfatherMaternal') {
          r.note = count === 1 ? t('noteGPPaternalAlone') : t('noteGMMaternalWithGFMaternal');
        } else if (type === 'grandmotherPaternal' || type === 'grandmotherMaternal') {
          r.note = count === 1 ? (getGender(type) === 'female' ? t('noteGPPaternalAloneFemale') : t('noteGPPaternalAlone')) : t('noteGMMaternalWithGFMaternal');
        } else if (siblingTypes.includes(type)) {
          const isMale = getGender(type) === 'male';
          if (count === 1 && type === 'sister') {
            r.note = isMale ? t('noteSisterAloneMale') : t('noteSisterAloneFemale');
          } else if (count === 1 && type === 'sisterPaternal') {
            r.note = isMale ? t('noteSisterPaternalAloneMale') : t('noteSisterPaternalAloneFemale');
          } else if (count === 1 && (type === 'brother' || type === 'brotherPaternal')) {
            r.note = isMale ? t('noteBrotherAloneMale') : t('noteBrotherAloneFemale');
          } else if (maternalSiblingTypes.includes(type)) {
            if (count === 1) {
              r.note = type === 'brotherMaternal' ? t('noteMaternalBrotherAlone') : t('noteMaternalSisterAlone');
            } else {
              r.note = t('noteMaternalSiblingsAlone');
            }
          } else {
            r.note = t('notePaternalSiblingsAlone');
          }
        } else if (uncleAuntTypes.includes(type)) {
          if (count === 1) {
            if (type === 'unclePaternalMaternal') {
              r.note = t('noteUnclePaternalMaternalSingleAlone');
            } else if (maternalSideUncleAuntTypes.includes(type)) {
              r.note = t('noteUncleMaternalSingleAlone');
            } else {
              r.note = t('noteUnclePaternalSingleAlone');
            }
          } else {
            if (paternalSideUncleAuntTypes.includes(type)) {
              r.note = t('noteUncleAuntPaternalAlone');
            } else {
              r.note = t('noteUncleAuntMaternalAlone');
            }
          }
        } else if (nephewNieceTypes.includes(type)) {
          if (count > 1 && r.note && r.note !== 'الباقي' && r.note !== 'The Remainder') {
            return;
          }
          const isMale = getGender(type) === 'male';
          if (count === 1) {
            if (['brotherSon', 'brotherSonPaternal', 'brotherDaughter', 'brotherDaughterPaternal'].includes(type)) {
              r.note = isMale ? t('noteBrotherAloneMale') : t('noteBrotherAloneFemale');
            } 
            else if (['sisterSon', 'sisterDaughter'].includes(type)) {
              r.note = isMale ? t('noteSisterAloneMale') : t('noteSisterAloneFemale');
            }
            else if (['sisterSonPaternal', 'sisterDaughterPaternal'].includes(type)) {
              r.note = isMale ? t('noteSisterPaternalAloneMale') : t('noteSisterPaternalAloneFemale');
            }
          }
        } else if (grandchildrenTypes.includes(type)) {
          const isMale = getGender(type) === 'male';
          if (count === 1) {
            if (type === 'sonOfSon' || type === 'daughterOfSon') {
              r.note = isMale ? t('noteSonAlone') : t('noteBrotherAloneFemale');
            } else {
              r.note = isMale ? t('noteBrotherAloneMale') : t('noteBrotherAloneFemale');
            }
          }
        }
      });
    }
    
    updatedActiveResults.forEach(r => {
      const isMale = getGender(r.heirType) === 'male';
      if (r.percentage > 99.99 && nephewNieceTypes.includes(r.heirType)) {
        if (['brotherSon', 'brotherSonPaternal', 'brotherDaughter', 'brotherDaughterPaternal'].includes(r.heirType)) {
          r.note = isMale ? t('noteBrotherAloneMale') : t('noteBrotherAloneFemale');
        } else if (['sisterSon', 'sisterDaughter'].includes(r.heirType)) {
          r.note = isMale ? t('noteSisterAloneMale') : t('noteSisterAloneFemale');
        } else if (['sisterSonPaternal', 'sisterDaughterPaternal'].includes(r.heirType)) {
          r.note = isMale ? t('noteSisterPaternalAloneMale') : t('noteSisterPaternalAloneFemale');
        } else {
          r.note = isMale ? t('noteBrotherAloneMale') : t('noteBrotherAloneFemale');
        }
      }
      else if (r.percentage > 99.99 && (r.note === t('noteFatherResiduary') || r.note === 'الباقي' || r.note === 'The Remainder' || r.note.includes('الباقي') || r.note.includes('Remainder'))) {
        if (r.heirType === 'father' || r.heirType === 'son') {
          r.note = isMale ? t('noteFatherAll') : t('noteBrotherAloneFemale');
        } else if (r.heirType === 'daughter') {
          if (updatedActiveResults.length === 1) {
            r.note = t('noteBrotherAloneFemale');
          } else if (updatedActiveResults.length === 2) {
            r.note = t('daughterNoteTwoThirdsRahm');
          } else {
            r.note = t('daughterNoteTwoThirdsRahmPlural');
          }
        } else if (uncleAuntTypes.includes(r.heirType)) {
          if (maternalSideUncleAuntTypes.includes(r.heirType)) {
            r.note = isMale ? t('noteUncleMaternalSingleAlone') : t('noteBrotherAloneFemale');
          } else {
            r.note = isMale ? t('noteUnclePaternalSingleAlone') : t('noteBrotherAloneFemale');
          }
        }
      }
    });
  }

  // Removed hardcoded overrides for nephews/nieces to allow correct, dynamic, and organic calculations for all parents' names.

  return { results, isKalala };
}
