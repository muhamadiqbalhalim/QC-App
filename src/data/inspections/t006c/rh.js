/**
 * =========================================================
 * T006C RH DATASET
 * =========================================================
 */

const t006cRHData = {

  id: 'RH',

  title: 'Right Hand Inspection',

  /**
   * =========================================================
   * INPUT CONFIGURATION
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
      id: 'RH-001',

      item:
        'ARM ASSY, RR SUSPENSION - End plate hole no adhesive spatter (RH)',

      criteria:
        'No adhesive spatter',

      stdImg:
        't006c_rh_std_1.png',

      photoImg:
        't006c_rh_ri_1.png',

      rank: 'S',

      keyPoint:
        'Q - Go Nogo Pin fully insert & no gap between End Plate & marking "OK" after Gonogo check',

      method:
        'Visual & touch & Go Nogo pin & marking using dermatograph pencil',

      ct: '7s',
    },

    {
      id: 'RH-002',

      item:
        'ARM ASSY, RR SUSPENSION - Installation dimension Brkt absorber (RH)',

      criteria:
        'Pitch installation dimension',

      stdImg:
        't006c_rh_std_2.png',

      photoImg:
        't006c_rh_ri_2.png',

      rank: 'S',

      keyPoint:
        'Q - check dimension brkt absorber. Make sure Go gauge fully insert & Pin can insert smoothly, Nogo gauge cannot insert & marking "OK" after Gonogo check',

      method:
        'Visual & touch & Go Nogo gauge & marking using dermatograph pencil',

      ct: '15s',
    },

    {
      id: 'RH-003',

      item:
        'ARM ASSY, RR SUSPENSION - Bending brkt flexible hose (RH)',

      criteria:
        'Brkt flexible hose bending',

      stdImg:
        't006c_rh_std_3.png',

      photoImg:
        't006c_rh_ri_3.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Make sure Go gauge touching arm, Nogo gauge not touching arm & marking "OK" after Gonogo check',

      method:
        'Visual & touch & Go Nogo gauge & marking using dermatograph pencil',

      ct: '10s',
    },

    {
      id: 'RH-004',

      item:
        'ARM ASSY, RR SUSPENSION - Front view (RH)',

      criteria:
        'Part appearance',

      stdImg:
        't006c_rh_std_4.png',

      photoImg:
        't006c_rh_ri_4.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & no spatter allowed on 6 red circle point & marking "SLASH" after inspection',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '7s',
    },

    {
      id: 'RH-005',

      item:
        'ARM ASSY, RR SUSPENSION - Front view (RH)',

      criteria:
        'Welding appearance',

      stdImg:
        't006c_rh_std_5.png',

      photoImg:
        't006c_rh_ri_5.png',

      rank: 'S',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & marking "SLASH" after inspect the welding point ①~⑦',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '12s',
    },

    {
      id: 'RH-006',

      item:
        'ARM ASSY, RR SUSPENSION - Back view (RH)',

      criteria:
        'Part appearance',

      stdImg:
        't006c_rh_std_6.png',

      photoImg:
        't006c_rh_ri_6.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & no spatter allowed on 6 red circle point & marking "SLASH" after inspection',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '4s',
    },

    {
      id: 'RH-007',

      item:
        'ARM ASSY, RR SUSPENSION - Back view (RH)',

      criteria:
        'Welding appearance',

      stdImg:
        't006c_rh_std_7.png',

      photoImg:
        't006c_rh_ri_7.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Checking from top to bottom & marking "SLASH" after inspect the welding point ①~⑥',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '12s',
    },

    {
      id: 'RH-008',

      item:
        'ARM ASSY, RR SUSPENSION - Alignment ID',

      criteria:
        'Available',

      stdImg:
        't006c_rh_std_8.png',

      photoImg:
        't006c_rh_ri_8.png',

      rank: 'B',

      keyPoint:
        'Q - finger & eye same direction. Marking "SLASH" after inspect the alignment id available at coil spring RH only',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '3s',
    },

    {
      id: 'RH-009',

      item:
        'ARM ASSY, RR SUSPENSION - M6 nut availability (RH)',

      criteria:
        'Available & right position',

      stdImg:
        't006c_rh_std_9.png',

      photoImg:
        't006c_rh_ri_9.png',

      rank: 'S',

      keyPoint:
        'Q - fully Insert scribbing pin to check nut position. Marking "OK" after inspect the nut availability & position (Inspect use scribbing pin for 2 pcs part in 1 kanban only)',

      method:
        'Visual & touch & marking using dermatograph pencil',

      ct: '8s',
    },

    {
      id: 'RH-010',

      item:
        'ARM ASSY, RR SUSPENSION - Brkt bar stabilizer welding detach (RH)',

      criteria:
        'Welding detach',

      stdImg:
        't006c_rh_std_10.png',

      photoImg:
        't006c_rh_ri_10.png',

      rank: 'B',

      keyPoint:
        'Q - knocking 3 times at middle bar stabilizer',

      method:
        'Visual & touch & knocking using rubber mullet',

      ct: '10s',
    },

    {
      id: 'RH-011',

      item:
        'ARM ASSY, RR SUSPENSION - Inside view (RH)',

      criteria:
        'Welding appearance',

      stdImg:
        't006c_rh_std_11.png',

      photoImg:
        't006c_rh_ri_11.png',

      rank: 'S',

      keyPoint:
        'Q - Insert endoscope camera in the hidden view to see welding appearance brkt reinforcement bar & marking "OK" after inspection (Inspect 2 pcs part in 1 kanban only)',

      method:
        'Visual & endoscope',

      ct: '15s',
    },

    {
      id: 'RH-012',

      item:
        'ARM ASSY, RR SUSPENSION - Thread end plate (RH)',

      criteria:
        'No adhesive spatter',

      stdImg:
        't006c_rh_std_12.png',

      photoImg:
        't006c_rh_ri_12.png',

      rank: 'B',

      keyPoint:
        'Q - Rotate the part to front view the insert bolt (Total 4 Bolt & fully insert)',

      method:
        'Visual & touch & insert bolt',

      ct: '20s',
    },

    {
      id: 'RH-013',

      item:
        'ARM ASSY, RR SUSPENSION - Kanban and OK tagging',

      criteria:
        'Kanban tagging',

      stdImg:
        't006c_rh_std_13.png',

      photoImg:
        't006c_rh_ri_13.png',

      rank: 'B',

      keyPoint:
        'Q - After inspection process put part on the rack. Put Kanban sheet & OK tagging at the rack. Information at kanban same in actual condition',

      method:
        'Visual & touch & compare actual part with actual kanban',

      ct: '4s',
    },

  ],

};

export default t006cRHData;