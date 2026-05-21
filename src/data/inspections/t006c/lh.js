const t006cLHData = {
  id: 'LH',

  title: 'Left Hand Inspection',

  /**
   * =========================================================
   * DYNAMIC INPUT CONFIGURATION
   * =========================================================
   * Future-proof input architecture.
   *
   * Supported future types:
   * - number
   * - select
   * - checkbox
   * - textarea
   * - image
   * - signature
   * =========================================================
   */
  inputs: [
    {
      id: 'insp',
      label: 'Insp. Res',
      type: 'number',
    },

    {
      id: 'keyPt',
      label: 'KeyPt Res',
      type: 'number',
    },

    {
      id: 'seq',
      label: 'Seq. Res',
      type: 'number',
    },
  ],

  /**
   * =========================================================
   * INSPECTION ROWS
   * =========================================================
   */
  rows: [
    {
      id: 'LH-001',

      item: 'ARM ASSY, RR SUSPENSION - End plate hole no adhesive spatter (LH)',

      criteria: 'No adhesive spatter',

      stdImg: 't006c_lh_std_1.png',

      photoImg: 't006c_lh_ri_1.png',

      rank: 'S',

      keyPoint:
        'Q - Go Nogo Pin fully insert & no gap between End Plate & marking "OK" after Gonogo check',

      method:
        'Visual & touch & Go Nogo pin & marking using dermatograph pencil',

      ct: '7s',
    },

    {
      id: 'LH-002',

      item: 'ARM ASSY, RR SUSPENSION - Installation dimension Brkt absorber (LH)',

      criteria: 'Pitch installation dimension',

      stdImg: 't006c_lh_std_2.png',

      photoImg: 't006c_lh_ri_2.png',

      rank: 'S',

      keyPoint:
        'Q - check dimension brkt absorber. Make sure Go gauge fully insert & Pin can insert smoothly, Nogo gauge cannot insert & marking "OK" after Gonogo check',

      method:
        'Visual & touch & Go Nogo gauge & marking using dermatograph pencil',

      ct: '15s',
    },

    {
      id: 'LH-003',

      item: 'ARM ASSY, RR SUSPENSION - Bending brkt flexible hose (LH)',

      criteria: 'Brkt flexible hose bending',

      stdImg: 't006c_lh_std_3.png',

      photoImg: 't006c_lh_ri_3.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Make sure Go gauge touching arm, Nogo gauge not touching arm & marking "OK" after Gonogo check',

      method:
        'Visual & touch & Go Nogo gauge & marking using dermatograph pencil',

      ct: '10s',
    },

    {
      id: 'LH-004',

      item: 'ARM ASSY, RR SUSPENSION - Front view (LH)',

      criteria: 'Part appearance',

      stdImg: 't006c_lh_std_4.png',

      photoImg: 't006c_lh_ri_4.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & no spatter allowed on 6 red circle point & marking "SLASH" after inspection',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '7s',
    },

    {
      id: 'LH-005',

      item: 'ARM ASSY, RR SUSPENSION - Front view (LH)',

      criteria: 'Welding appearance',

      stdImg: 't006c_lh_std_5.png',

      photoImg: 't006c_lh_ri_5.png',

      rank: 'S',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & marking "SLASH" after inspect the welding point ①~⑦',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '12s',
    },

    {
      id: 'LH-006',

      item: 'ARM ASSY, RR SUSPENSION - Back view (LH)',

      criteria: 'Part appearance',

      stdImg: 't006c_lh_std_6.png',

      photoImg: 't006c_lh_ri_6.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & no spatter allowed on 6 red circle point & marking "SLASH" after inspection',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '4s',
    },

    {
      id: 'LH-007',

      item: 'ARM ASSY, RR SUSPENSION - Back view (LH)',

      criteria: 'Welding appearance',

      stdImg: 't006c_lh_std_7.png',

      photoImg: 't006c_lh_ri_7.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & marking "SLASH" after inspect the welding point ①~⑥',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '12s',
    },

    {
      id: 'LH-008',

      item: 'ARM ASSY, RR SUSPENSION - M6 nut availability (LH)',

      criteria: 'Available & right position',

      stdImg: 't006c_lh_std_8.png',

      photoImg: 't006c_lh_ri_8.png',

      rank: 'S',

      keyPoint:
        'Q - fully Insert scribbing pin to check nut position. Marking "OK" after inspect the nut availability & position (Inspect use scribbing pin for 2 pcs part in 1 kanban only)',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '8s',
    },

    {
      id: 'LH-009',

      item: 'ARM ASSY, RR SUSPENSION - Brkt bar stabilizer welding detach inspection (LH)',

      criteria: 'Welding detach',

      stdImg: 't006c_lh_std_9.png',

      photoImg: 't006c_lh_ri_9.png',

      rank: 'B',

      keyPoint:
        'Q - knocking 3 times at middle bar stabilize',

      method:
        'Visual & touch & knocking using rubber mullet',

      ct: '10s',
    },

    {
      id: 'LH-010',

      item: 'ARM ASSY, RR SUSPENSION - Inside view (LH)',

      criteria: 'Welding appearance',

      stdImg: 't006c_lh_std_10.png',

      photoImg: 't006c_lh_ri_10.png',

      rank: 'S',

      keyPoint:
        'Q - Insert endoscope camera in the hidden view to see welding appearance brkt reinforcement bar & marking "OK" after inspection (Inspect 2 pcs part in 1 kanban only)',

      method:
        'Visual & endoscope',

      ct: '15s',
    },

    {
      id: 'LH-011',

      item: 'ARM ASSY, RR SUSPENSION - Thread end plate (LH)',

      criteria: 'No adhesive spatter',

      stdImg: 't006c_lh_std_11.png',

      photoImg: 't006c_lh_ri_11.png',

      rank: 'B',

      keyPoint:
        'Q - Rotate the part to front view the insert bolt (Total 4 Bolt & fully insert)',

      method:
        'Visual & touch & insert bolt',

      ct: '20s',
    },

    {
      id: 'LH-012',

      item: 'ARM ASSY, RR SUSPENSION - Kanban and OK tagging',

      criteria: 'Kanban tagging',

      stdImg: 't006c_lh_std_12.png',

      photoImg: 't006c_lh_ri_12.png',

      rank: 'B',

      keyPoint:
        'Q - After inspection process put part on the rack. Put Kanban sheet & OK tagging at the rack. Information at kanban same in actual condition',

      method:
        'Visual & touch & compare actual part with actual kanban',

      ct: '4s',
    },
  ],
};

export default t006cLHData;