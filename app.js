// app.js - ระบบโต้ตอบและประมวลผลคู่มือบริการระหว่างประเทศ ปณท (อัปเดต พฤศจิกายน 2569)

(function () {
  const DATA = window.THP_INTER_DATA;

  // ตารางขนาดและราคากล่อง ปณท (อ้างอิงเอกสารรวมขนาดการรับฝากฯ 2569)
  const THP_BOXES = [
    { name: "กล่อง AA", size: "13 × 17 × 7 ซม.", sum: 37, price: "9 บาท", epacketUsEu: true },
    { name: "กล่อง ก", size: "14 × 20 × 6 ซม.", sum: 40, price: "12 บาท", epacketUsEu: true },
    { name: "กล่อง ข", size: "17 × 25 × 9 ซม.", sum: 51, price: "15 บาท", epacketUsEu: true },
    { name: "กล่อง ค", size: "20 × 30 × 11 ซม.", sum: 61, price: "20 บาท", epacketUsEu: true },
    { name: "กล่อง ง", size: "22 × 35 × 14 ซม.", sum: 71, price: "25 บาท", epacketUsEu: true },
    { name: "กล่อง จ", size: "24 × 40 × 17 ซม.", sum: 81, price: "32 บาท", epacketUsEu: true },
    { name: "กล่อง ฉ", size: "30 × 45 × 20 ซม.", sum: 95, price: "45 บาท", epacketUsEu: true },
    { name: "กล่องเบอร์ 1 (ทรงยาว)", size: "6 × 60 × 6 ซม.", sum: 72, price: "20 บาท", epacketUsEu: false, note: "ยาว 60 ซม. ห้ามใช้กับ ePacket US (จำกัด 55 ซม.)" },
    { name: "กล่องเบอร์ 2", size: "10 × 50 × 20 ซม.", sum: 80, price: "30 บาท", epacketUsEu: true },
    { name: "กล่องเบอร์ 3", size: "11 × 55 × 27 ซม.", sum: 93, price: "35 บาท", epacketUsEu: true },
    { name: "กล่องเบอร์ 4", size: "21 × 70 × 31 ซม.", sum: 122, price: "65 บาท", epacketUsEu: false, note: "ยาว 70 ซม. เกินเกณฑ์ ePacket ทุกประเภท" },
    { name: "กล่องเบอร์ 5", size: "40 × 45 × 35 ซม.", sum: 120, price: "65 บาท", epacketUsEu: false, note: "ผลรวม 120 ซม. (เกิน ePacket US 100 ซม. / ด้านสูง 35 ซม. เกินเกณฑ์ 30 ซม. ของ EU)" },
    { name: "กล่องเบอร์ 6", size: "45 × 55 × 40 ซม.", sum: 140, price: "95 บาท", epacketUsEu: false, note: "ผลรวม 140 ซม. เกินเกณฑ์ ePacket ทุกประเภท" }
  ];

  // State สำหรับตัวช่วยตัดสินใจ 3 วินาที
  let wizardState = {
    dest: "eu",
    item: "general"
  };

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 1. Render ตัวช่วยตัดสินใจด่วน 3 วินาที (Wizard)
  function renderWizardOutput() {
    const out = document.getElementById("wizardOutput");
    if (!out) return;

    const { dest, item } = wizardState;
    let html = "";

    if (dest === "eu") {
      if (item === "food") {
        html = `
          <div style="color:#991B1B; font-weight:700; font-size:15px; margin-bottom:8px;">
            🚫 ห้ามรับฝากด้วยบริการ ePacket DDP (LE) เด็ดขาด!
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="critical"><strong>กฎเหล็ก EU (ปณท บร.(จร.1)/1921):</strong> ห้ามส่งอาหารทุกชนิด อาหารเสริม วิตามิน ขนม ชา กาแฟ เครื่องปรุง นมผง อาหารสัตว์ ในบริการ <strong>ePacket DDP (LE)</strong> โดยเด็ดขาด! (แม้มี อย. ก็ห้ามส่ง ฝ่าฝืนโดนปรับขั้นต่ำ <strong>3,100 บาท/กล่อง</strong>)</li>
            <li class="good"><strong>✅ ทางเลือกที่ส่งได้:</strong> แนะนำให้ลูกค้าเปลี่ยนไปส่งด้วยบริการ <strong>Courier Post Plus</strong> (เฉพาะประเทศ EU ที่เปิดบริการ เช่น ฝรั่งเศส, เยอรมนี, อิตาลี, เนเธอร์แลนด์, สวีเดน — ต้องเป็นอาหารแปรรูปมีฉลากและ อย. ชัดเจน ห้ามอาหารทำเอง Homecook) หรือ <strong>Courier Post (Merchandise)</strong></li>
            <li><strong>⚠️ หมายเหตุ:</strong> บริการ EMS World (Package) ปัจจุบันไม่เปิดรับฝากสิ่งของไปกลุ่มประเทศ EU 27 ประเทศสำหรับลูกค้าทั่วไป</li>
            <li><strong>🆔 ต้องทำจ่าหน้าผ่าน D-Post Inter และกรอกรหัส PID (M-PID / NS-PID) ทุกชิ้น!</strong></li>
          </ul>
        `;
      } else if (item === "doc") {
        html = `
          <div style="color:#1E40AF; font-weight:700; font-size:15px; margin-bottom:8px;">
            📄 ส่งเอกสารล้วน (Document) ไปสหภาพยุโรป (EU 27 ประเทศ)
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="good"><strong>✅ บริการที่ใช้ได้:</strong> <strong>EMS World (Document - ED)</strong>, <strong>Courier Post (Document)</strong>, <strong>จดหมาย / จดหมายลงทะเบียน (RR)</strong>, <strong>ของตีพิมพ์ / ถุงรวมของตีพิมพ์ (M-Bag)</strong></li>
            <li class="critical"><strong>⚠️ ข้อควรระวัง:</strong> ต้องเป็นเอกสารล้วนตามเกณฑ์เท่านั้น ห้ามสอดไส้สินค้าหรือสิ่งของเด็ดขาด! (และปลายทาง <strong>เยอรมนี</strong> งดบริการทางภาคพื้น/ทางเรือทุกประเภท)</li>
          </ul>
        `;
      } else if (item === "cosmetic") {
        html = `
          <div style="color:#065F46; font-weight:700; font-size:15px; margin-bottom:8px;">
            🧴 ส่งยาดม / ครีม / เครื่องสำอาง / แชมพู ไป EU 27 ประเทศ
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="good"><strong>✅ ส่งผ่าน ePacket DDP (LE) ได้ (ภายใต้เงื่อนไขเคร่งครัด):</strong>
              <br>• <strong>ยาดม ยาหม่อง ยาลม พิมเสนน้ำ:</strong> ขวดละไม่เกิน 100 ml และ <strong>รวมไม่เกิน 6 ชิ้น/กล่อง</strong> (ต้องมี อย. ห้ามสเปรย์/แอลกอฮอล์สูง)
              <br>• <strong>เครื่องสำอาง (Toner, Serum, ครีม):</strong> ขวดละไม่เกิน 100 ml และน้ำหนักรวมของเหลวทั้งหมด <strong>ไม่เกิน 1 กก./กล่อง</strong>
              <br>• <strong>แชมพู ครีมนวด สบู่เหลว:</strong> ไม่จำกัดปริมาตรต่อขวด แต่น้ำหนักรวมของเหลวทั้งหมดในกล่องต้อง <strong>ไม่เกิน 1 กก./กล่อง</strong>
            </li>
            <li class="critical"><strong>🚨 สิ่งที่เจ้าหน้าที่ต้องทำหน้าเคาน์เตอร์ (ePacket DDP - LE):</strong>
              <br>1. ลูกค้าต้องทำจ่าหน้าผ่าน <strong>D-Post Inter</strong> (สกุลเงิน <strong>EUR</strong> มูลค่ารวมไม่เกิน <strong>150 EUR/กล่อง</strong>) + กรอกรหัส <strong>M-PID</strong> และ <strong>NS-PID</strong>
              <br>2. <strong>เปิดตรวจของจริง 100%</strong> ให้ลูกค้าติ๊กใบ Checklist 14 ข้อ แล้วประทับตรา/เขียน <strong>"Content Checked"</strong> หน้ากล่อง
              <br>3. รับชำระค่าภาษีผ่าน <strong>Pay@Post (รหัส 84415)</strong> แล้วต้องประทับตรา/เขียน <strong>"Duties Paid"</strong> บนใบจ่าหน้าทุกชิ้น!
              <br>4. 🎁 <strong>โปรโมชั่น 1 พ.ย. – 31 ธ.ค. 69:</strong> สมาชิก POST Family ลด 5% (ปุ่ม <code>ส่วนลดตามแคมเปญ ePacket DDP 5%</code>)
            </li>
          </ul>
        `;
      } else {
        html = `
          <div style="color:#1E40AF; font-weight:700; font-size:15px; margin-bottom:8px;">
            🇪🇺 ส่งสินค้าทั่วไป ไปสหภาพยุโรป (EU 27 ประเทศ) — อัปเดต 1 พ.ย. 69
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="good"><strong>✅ บริการที่แนะนำ:</strong>
              <br>1. <strong>ePacket DDP (LE):</strong> ขยายครบทั้ง 27 ประเทศ EU แล้ว! (นน.สูงสุด <strong>5 กก.</strong>, ด้านยาวสุดไม่เกิน <strong>60 ซม.</strong>, อีก 2 ด้านไม่เกิน 40 และ 30 ซม., ก+ย+ส ไม่เกิน <strong>130 ซม.</strong>, มูลค่าไม่เกิน <strong>150 EUR</strong>)
              <br>2. <strong>Courier Post (Merchandise)</strong> หรือ <strong>Courier Post Plus</strong> (สำหรับของเกิน 5 กก. หรือมูลค่าเกิน 150 EUR)
            </li>
            <li class="critical"><strong>🚨 เช็คลิสต์บังคับหน้าเคาน์เตอร์ (ห้ามลืมเด็ดขาด!):</strong>
              <br>• ต้องทำจ่าหน้าผ่าน <strong>D-Post Inter</strong> เท่านั้น + ต้องกรอกรหัสสินค้า <strong>M-PID</strong> และ <strong>NS-PID</strong> ทุกชิ้น!
              <br>• <strong>เปิดตรวจสิ่งของ 100%</strong> (ห้ามมีอาหาร/อาหารเสริม/แบตเตอรี่/แม่เหล็ก) ให้ลูกค้าเซ็นใบ Checklist และเขียน/ประทับตรา <strong>"Content Checked"</strong> บนหน้ากล่อง
              <br>• ยิงบาร์โค้ดที่ 2 รับชำระภาษีผ่าน <strong>Pay@Post (รหัส 84415)</strong> แล้วเขียน/ประทับตรา <strong>"Duties Paid"</strong> บนใบจ่าหน้า!
              <br>• <strong>ห้ามใช้คำกำกวม:</strong> ห้ามสำแดงว่า Gift, Sample, Accessories, Clothes เฉยๆ (ต้องระบุชัด เช่น Men's Cotton T-Shirt)
              <br>• 🎁 <strong>ส่วนลด 5% (1 พ.ย. – 31 ธ.ค. 69):</strong> สมาชิก POST Family กดปุ่ม <code>ส่วนลดตามแคมเปญ ePacket DDP 5%</code>
            </li>
          </ul>
        `;
      }
    } else if (dest === "us") {
      if (item === "food") {
        html = `
          <div style="color:#991B1B; font-weight:700; font-size:15px; margin-bottom:8px;">
            🚫 ห้ามส่งอาหารผ่าน ePacket US (LA/LI) เด็ดขาด! (แต่ส่งผ่านบริการอื่นได้)
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="critical"><strong>❌ ห้ามใช้ ePacket US (LA/LI):</strong> บริการ ePacket ไปสหรัฐอเมริกา ห้ามส่งอาหารทุกชนิด อาหารเสริม วิตามิน ขนม ชา กาแฟ เครื่องปรุง นมผง อาหารสัตว์ โดยเด็ดขาด! (ฝ่าฝืนถูกปรับขั้นต่ำ <strong>3,100 บาท/กล่อง</strong>)</li>
            <li class="good"><strong>✅ บริการที่ส่งอาหารแห้งมี อย. ไปสหรัฐฯ ได้:</strong>
              <br>1. <strong>EMS World (Package - EE)</strong> — ส่งอาหารแห้ง/ไม่เน่าเสียง่ายที่มีเครื่องหมาย อย. และฉลากภาษาอังกฤษชัดเจนได้ตามปกติ
              <br>2. <strong>Courier Post Plus (FD 1–20 กก. / FC >20–5,000 กก.)</strong> — ส่งอาหารแปรรูปที่มีฉลากและ อย. ได้ (ห้ามอาหารทำเอง Homecook) *และช่วง 1 ต.ค.–30 พ.ย. 69 มีโปรแชร์สื่อลด 5% ปุ่ม <code>PostPlusDDP5%</code>*
              <br>3. <strong>พัสดุไปรษณีย์ทางอากาศ (CP)</strong> หรือ <strong>Courier Post (Merchandise)</strong>
            </li>
          </ul>
        `;
      } else if (item === "doc") {
        html = `
          <div style="color:#991B1B; font-weight:700; font-size:15px; margin-bottom:8px;">
            📄 กฎเหล็กส่งเอกสาร (Document) ไปสหรัฐอเมริกา (US)!
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="critical"><strong>🚨 จำกัดน้ำหนักไม่เกิน 500 กรัม! (ปณท รร.(ปร.3)/2826):</strong>
              <br>การฝากส่งบริการ <strong>EMS World (Document)</strong>, <strong>ไปรษณียภัณฑ์ลงทะเบียน (เอกสาร)</strong>, <strong>จดหมาย</strong> และ <strong>ของตีพิมพ์</strong> ไปสหรัฐอเมริกา:
              <br>• ต้องบรรจุเฉพาะ <strong>เอกสารเท่านั้น</strong> (ห้ามมีสินค้า/สิ่งของปะปนเด็ดขาด)
              <br>• น้ำหนักต้อง <strong>ไม่เกิน 500 กรัม</strong>
              <br>• ขนาดต้องไม่เกินซอง P/G (<strong>30.5 × 38.1 × 2 ซม.</strong>)
            </li>
            <li class="good"><strong>💡 หากเอกสารหนักเกิน 500 กรัม หรือมีสิ่งของปะปน:</strong> ให้แนะนำใช้บริการ <strong>Courier Post (Document ไม่เกิน 2 กก.)</strong> หรือหากเป็นสิ่งของให้ใช้ <strong>ePacket US (LA/LI)</strong> / <strong>EMS World (Package)</strong> แทน</li>
          </ul>
        `;
      } else if (item === "cosmetic") {
        html = `
          <div style="color:#065F46; font-weight:700; font-size:15px; margin-bottom:8px;">
            🧴 ส่งยาดม / ครีม / เครื่องสำอาง / แชมพู ไปสหรัฐอเมริกา (US)
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="good"><strong>✅ ส่งผ่าน ePacket US (LA/LI) ได้ตามโควตาที่กำหนด:</strong>
              <br>• <strong>ยาดม ยาหม่อง ยาลม พิมเสนน้ำ:</strong> ขวดละไม่เกิน 100 ml และ <strong>รวมไม่เกิน 6 ชิ้น/กล่อง</strong> (ต้องมี อย.)
              <br>• <strong>เครื่องสำอาง (Toner, Serum, ครีม):</strong> ขวดละไม่เกิน 100 ml และน้ำหนักรวมของเหลวทั้งหมด <strong>ไม่เกิน 1 กก./กล่อง</strong>
              <br>• <strong>แชมพู ครีมนวด สบู่เหลว:</strong> น้ำหนักรวมของเหลวทั้งหมดในกล่องต้อง <strong>ไม่เกิน 1 กก./กล่อง</strong>
            </li>
            <li class="critical"><strong>🚨 สิ่งที่ต้องตรวจก่อนรับฝาก ePacket US (LA/LI):</strong>
              <br>• ทำจ่าหน้าผ่าน <strong>D-Post Inter</strong> (สกุลเงิน <strong>USD</strong> มูลค่ารวมไม่เกิน <strong>60 USD/กล่อง</strong>, นน.ไม่เกิน <strong>5 กก.</strong>, ยาวสุดไม่เกิน 55 ซม., ก+ย+ส ไม่เกิน 100 ซม.)
              <br>• <strong>เปิดตรวจของจริง 100%</strong> ให้ลูกค้าเซ็นใบ Checklist และประทับตรา/เขียน <strong>"Content Checked"</strong> บนหน้ากล่อง!
            </li>
          </ul>
        `;
      } else {
        html = `
          <div style="color:#1E40AF; font-weight:700; font-size:15px; margin-bottom:8px;">
            🇺🇸 ส่งสินค้าทั่วไป ไปสหรัฐอเมริกา (US)
          </div>
          <ul class="notes-list" style="margin-top:0;">
            <li class="good"><strong>✅ บริการยอดนิยมที่เลือกใช้ได้:</strong>
              <br>1. <strong>ePacket US (LA = 48 รัฐแผ่นดินใหญ่ / LI = Alaska, Hawaii, เกาะ, APO):</strong> รวมภาษี DDP ในค่าส่งแล้ว! นน.ไม่เกิน <strong>5 กก.</strong>, มูลค่าไม่เกิน <strong>60 USD/กล่อง</strong>, ยาวสุดไม่เกิน <strong>55 ซม.</strong> และ ก+ย+ส ไม่เกิน <strong>100 ซม.</strong>
              <br>2. <strong>Courier Post Plus (FD 1–20 กก. / FC >20–5,000 กก.):</strong> รวมภาษี DDP ได้ ส่งหลายกล่องรวมน้ำหนักได้ (มีโปรแชร์สื่อลด 5% ปุ่ม <code>PostPlusDDP5%</code> ถึง 30 พ.ย. 69)
              <br>3. <strong>EMS World (Package - EE)</strong> หรือ <strong>Courier Post (Merchandise)</strong>
            </li>
            <li class="critical"><strong>🚨 เช็คลิสต์บังคับสำหรับ ePacket US (LA/LI):</strong>
              <br>• ต้องทำจ่าหน้าผ่าน <strong>D-Post Inter</strong> (สกุลเงิน <strong>USD</strong> เท่านั้น)
              <br>• <strong>เปิดตรวจของ 100% ทุกชิ้น!</strong> ให้ลูกค้าทำใบ Checklist และประทับตรา/เขียน <strong>"Content Checked"</strong> บนหน้ากล่อง (ห้ามมีอาหาร/อาหารเสริม/ยา/แบตเตอรี่/แม่เหล็ก/พระองค์ใหญ่)
              <br>• พระเครื่องขนาดห้อยคอส่งได้น้ำหนักรวมไม่เกิน <strong>500 กรัม/กล่อง</strong>
              <br>• ปิดถุงแยกเฉพาะ เขียนป้าย ป.322 ว่า <strong>"ePacket ปลายทาง US"</strong>
            </li>
          </ul>
        `;
      }
    } else if (dest === "uk") {
      html = `
        <div style="color:#065F46; font-weight:700; font-size:15px; margin-bottom:8px;">
          🇬🇧 ส่งไปสหราชอาณาจักร (อังกฤษ / UK) — *อยู่นอกสหภาพยุโรป (Non-EU)*
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>💡 ข้อสังเกตสำคัญ:</strong> สหราชอาณาจักร (UK) <strong>ไม่ใช่สมาชิก EU 27 ประเทศ</strong> (เช่นเดียวกับ สวิตเซอร์แลนด์ และ นอร์เวย์) จึงใช้บริการปกติได้ครบทุกบริการ!</li>
          <li class="good"><strong>✅ บริการที่ใช้ได้:</strong>
            <br>• <strong>ePacket ปกติ (บาร์โค้ด LX):</strong> พิเศษ! ปลายทาง UK รับน้ำหนักได้สูงสุดถึง <strong>5 กก.</strong> (ประเทศอื่นนอก US/EU รับได้ 2 กก.) และ <strong>สามารถส่งอาหารแห้งที่มี อย. ได้!</strong>
            <br>• <strong>EMS World (Document & Package):</strong> ส่งได้ทั้งเอกสารและสิ่งของ (สูงสุด 30 กก.)
            <br>• <strong>Courier Post Plus (FC):</strong> ส่งแบบ DDU หรือ DDP ได้ (มีส่วนลด 5% ปุ่ม <code>PostPlusDDP5%</code> เมื่อลูกค้าแชร์สื่อสาธารณะ ถึง 30 พ.ย. 69)
            <br>• <strong>Courier Post</strong> / <strong>พัสดุไปรษณีย์ระหว่างประเทศ</strong>
          </li>
          <li><strong>📝 การคีย์ข้อมูลศุลกากร:</strong> บันทึกข้อมูล ITMATT ภาษาอังกฤษให้ครบถ้วน (ไม่ต้องใช้ Pay@Post 84415 ของ EU)</li>
        </ul>
      `;
    } else {
      html = `
        <div style="color:#1E40AF; font-weight:700; font-size:15px; margin-bottom:8px;">
          🌏 ส่งไปประเทศอื่นๆ (เอเชีย / ญี่ปุ่น / เกาหลีใต้ / ออสเตรเลีย / แคนาดา ฯลฯ)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>✅ บริการที่ใช้ได้ครบถ้วน:</strong>
            <br>• <strong>ePacket (LP / LX):</strong> น้ำหนักไม่เกิน <strong>2 กก.</strong> (ยาวสุดไม่เกิน 60 ซม., ก+ย+ส ไม่เกิน 90 ซม.) — <strong>ส่งอาหารแห้งที่มีเครื่องหมาย อย. และฉลากชัดเจนได้!</strong> (ซื้อ ePacket Plus +30 บ. คุ้มครองสูงสุด 1,500 บ.)
            <br>• <strong>EMS World (EE / ED):</strong> ส่งได้ทั้งเอกสารและพัสดุ (รวมถึงอาหารแห้งมี อย.) *ระวัง: ออสเตรเลียจำกัดยาวสุดไม่เกิน 105 ซม. และนน.ไม่เกิน 20 กก.*
            <br>• <strong>Courier Post Plus (FC):</strong> เปิดบริการใน ญี่ปุ่น, เกาหลีใต้, ออสเตรเลีย, สิงคโปร์, ไต้หวัน, แคนาดา, จีน, ฮ่องกง, มาเลเซีย, อิสราเอล (ลด 5% ปุ่ม <code>PostPlusDDP5%</code> ถึง 30 พ.ย. 69)
            <br>• <strong>Courier Post</strong> / <strong>พัสดุไปรษณีย์</strong> / <strong>พัสดุย่อย</strong>
          </li>
          <li><strong>📝 ข้อควรจำ:</strong> บันทึกข้อมูลศุลกากรล่วงหน้า (ITMATT) เป็นภาษาอังกฤษให้ชัดเจนทุกชิ้น (ห้ามเขียนแค่ Gift หรือ Food)</li>
        </ul>
      `;
    }

    out.innerHTML = html;
  }

  function setupWizardEvents() {
    const destBtns = document.querySelectorAll("#wizDestGroup .pill-btn");
    const itemBtns = document.querySelectorAll("#wizItemGroup .pill-btn");

    destBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        destBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        wizardState.dest = btn.getAttribute("data-dest");
        renderWizardOutput();
      });
    });

    itemBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        itemBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        wizardState.item = btn.getAttribute("data-item");
        renderWizardOutput();
      });
    });

    renderWizardOutput();
  }

  // 2. Render ข้อมูลบริการทั้งหมด + ตารางขนาดกล่อง ปณท
  function renderServices() {
    const container = document.getElementById("servicesListContainer");
    if (!container) return;

    const servicesHtml = DATA.services
      .map((srv) => {
        const notesHtml = srv.criticalNotes
          .map((n) => {
            let cls = "";
            if (n.includes("🚨") || n.includes("⚠️") || n.includes("ห้าม")) cls = "critical";
            else if (n.includes("✅")) cls = "good";
            return `<li class="${cls}">${escapeHtml(n)}</li>`;
          })
          .join("");

        const formsHtml = (srv.requiredForms || [])
          .map((f) => `<li class="good" style="background:#EFF6FF; border-left-color:#2563EB; color:#1E3A8A;">${escapeHtml(f)}</li>`)
          .join("");

        const survivalHtml = (srv.survivalGuide || [])
          .map((s) => `<li class="critical">${escapeHtml(s)}</li>`)
          .join("");

        return `
          <div class="card" id="service-${escapeHtml(srv.id)}">
            <div class="card-header">
              <div>
                <span class="prefix-tag">${escapeHtml(srv.prefix)}</span>
                <div class="card-title">${escapeHtml(srv.name)}</div>
              </div>
              <span class="badge badge-${escapeHtml(srv.badgeColor)}">${escapeHtml(srv.badge)}</span>
            </div>

            ${
              srv.dpostInterMode
                ? `<div style="background:${srv.dpostInterMode.includes("🔴") ? "#FEF2F2" : srv.dpostInterMode.includes("🟡") ? "#FFFBEB" : "#ECFDF5"}; border:1.5px solid ${srv.dpostInterMode.includes("🔴") ? "#EF4444" : srv.dpostInterMode.includes("🟡") ? "#F59E0B" : "#10B981"}; border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:13.5px; font-weight:600; color:${srv.dpostInterMode.includes("🔴") ? "#991B1B" : srv.dpostInterMode.includes("🟡") ? "#92400E" : "#065F46"};">
                    💻 <strong>ต้องทำผ่าน D-Post Inter เท่านั้นไหม?:</strong><br>${escapeHtml(srv.dpostInterMode)}
                  </div>`
                : ""
            }

            ${
              formsHtml
                ? `<div style="font-size:14px; font-weight:700; color:#1E3A8A; margin-bottom:6px;">
                    📋 แบบพิมพ์ / เอกสาร / ตราประทับที่ต้องมีในการรับฝาก:
                  </div>
                  <ul class="notes-list" style="margin-bottom:12px;">${formsHtml}</ul>`
                : ""
            }

            ${
              survivalHtml
                ? `<div style="font-size:14px; font-weight:700; color:#991B1B; margin-bottom:6px;">
                    🛡️ คัมภีร์เอาตัวรอดของเจ้าหน้าที่รับฝาก (ป้องกันโดนเคลม/โดนปรับ/ของตีกลับ):
                  </div>
                  <ul class="notes-list" style="margin-bottom:12px;">${survivalHtml}</ul>`
                : ""
            }

            <div class="spec-grid">
              <div class="spec-item">
                <span class="spec-label">⚖️ พิกัดน้ำหนักสูงสุด</span>
                <span class="spec-value">${escapeHtml(srv.maxWeight)}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">📏 ขนาดสูงสุดที่รับฝากได้</span>
                <span class="spec-value">${escapeHtml(srv.maxSize)}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">📦 กล่องบรรจุภัณฑ์</span>
                <span class="spec-value">${escapeHtml(srv.allowedBoxes)}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">💶 มูลค่าสิ่งของสูงสุด</span>
                <span class="spec-value">${escapeHtml(srv.maxValue)}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">🛡️ อัตราชดใช้ค่าเสียหาย (ปี 2569)</span>
                <span class="spec-value">${escapeHtml(srv.indemnity)}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">🏛️ เงื่อนไขศุลกากร / ระบบรับฝาก</span>
                <span class="spec-value">${escapeHtml(srv.customsRule)}</span>
              </div>
            </div>

            <div style="font-size:14px; font-weight:700; color:var(--thp-navy); margin-bottom:6px;">
              📌 ข้อสังเกตสำคัญหน้าเคาน์เตอร์:
            </div>
            <ul class="notes-list">${notesHtml}</ul>

            <div class="ref-foot">📄 อ้างอิงบันทึก: ${escapeHtml(srv.ref)}</div>
          </div>
        `;
      })
      .join("");

    // เพิ่มตารางอ้างอิงขนาดและราคากล่อง ปณท ปี 2569
    const boxesRowsHtml = THP_BOXES.map(
      (b) => `
        <div class="spec-item" style="border-bottom:1px solid #E2E8F0; padding-bottom:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="spec-label">${escapeHtml(b.name)} (${escapeHtml(b.size)}) — รวม 3 ด้าน ${b.sum} ซม.</span>
            <span class="badge ${b.epacketUsEu ? "badge-emerald" : "badge-red"}">${escapeHtml(b.price)}</span>
          </div>
          <span class="spec-value" style="font-size:12.5px; color:${b.epacketUsEu ? "#047857" : "#B91C1C"};">
            ${b.epacketUsEu ? "✅ ใช้ส่ง ePacket US / ePacket DDP EU ได้" : "❌ " + escapeHtml(b.note)}
          </span>
        </div>
      `
    ).join("");

    const boxCardHtml = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">📐 ตารางขนาดและราคากล่อง ปณท (เช็คกล่องที่ใช้ส่ง ePacket ได้)</div>
          <span class="badge badge-blue">อัปเดต 2569</span>
        </div>
        <div class="spec-grid">
          ${boxesRowsHtml}
        </div>
        <div class="ref-foot">📄 อ้างอิง: เอกสารรวมขนาดการรับฝากสิ่งของตามประเภทบริการ 2569 และคู่มือ ePacket DDP / US</div>
      </div>
    `;

    container.innerHTML = servicesHtml + boxCardHtml;
  }

  // 3. Render โซนประเทศปลายทาง (Destinations)
  function renderDestinations() {
    const container = document.getElementById("destinationsContainer");
    if (!container) return;

    container.innerHTML = DATA.destinations
      .map((d) => {
        const chipsHtml = d.countries
          .map((c) => `<span class="country-chip">${escapeHtml(c)}</span>`)
          .join("");

        const docsHtml = d.allowedForDocs
          .map((item) => `<li class="good">📄 ${escapeHtml(item)}</li>`)
          .join("");

        const goodsHtml = d.allowedForGoods
          .map((item) => `<li class="good">📦 ${escapeHtml(item)}</li>`)
          .join("");

        const rulesHtml = d.mandatoryRules
          .map((r) => `<li class="critical" style="white-space:pre-line;">${escapeHtml(r)}</li>`)
          .join("");

        return `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${escapeHtml(d.zone)}</div>
              <span class="badge badge-blue">อัปเดตล่าสุด</span>
            </div>
            <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:8px;">
              ${escapeHtml(d.updated)}
            </div>

            <div style="font-size:13.5px; font-weight:700; color:var(--thp-navy);">รายชื่อประเทศในกลุ่มนี้ (${d.countries.length} รายการ):</div>
            <div class="country-chips">${chipsHtml}</div>

            ${
              d.nonEuWarning
                ? `<div style="background:#FFFBEB; border:1px solid #F59E0B; border-radius:10px; padding:10px; font-size:13px; color:#92400E; margin-bottom:10px; font-weight:600;">${escapeHtml(d.nonEuWarning)}</div>`
                : ""
            }

            <div style="font-size:13.5px; font-weight:700; color:var(--thp-navy); margin-top:8px;">✅ บริการที่รับฝาก【เอกสาร (Document)】ได้:</div>
            <ul class="notes-list">${docsHtml}</ul>

            <div style="font-size:13.5px; font-weight:700; color:var(--thp-navy); margin-top:8px;">✅ บริการที่รับฝาก【สิ่งของ/สินค้า (Goods)】ได้:</div>
            <ul class="notes-list">${goodsHtml}</ul>

            <div style="font-size:13.5px; font-weight:700; color:#991B1B; margin-top:8px;">🚨 กฎเหล็กที่ต้องปฏิบัติทุกครั้ง:</div>
            <ul class="notes-list">${rulesHtml}</ul>
          </div>
        `;
      })
      .join("");
  }

  // 4. Render สิ่งของต้องห้าม & ข้อยกเว้นของเหลว/พระเครื่อง
  function renderProhibited() {
    const container = document.getElementById("prohibitedContainer");
    if (!container) return;

    const pg = DATA.prohibitedGuide;
    const strictItemsHtml = pg.strictBanEpacketUsEu.items
      .map((item) => `<li class="critical">${escapeHtml(item)}</li>`)
      .join("");

    const exceptionsHtml = pg.strictBanEpacketUsEu.allowedExceptions
      .map(
        (ex) => `
        <div class="spec-item" style="border-bottom:1px solid #E2E8F0; padding-bottom:8px;">
          <span class="spec-label" style="color:#047857;">✅ ${escapeHtml(ex.category)}</span>
          <span class="spec-value"><strong>โควตาที่ส่งได้:</strong> ${escapeHtml(ex.limit)}</span>
          <span class="spec-value" style="font-size:12.5px; color:var(--text-muted);"><strong>เงื่อนไข:</strong> ${escapeHtml(ex.condition)}</span>
        </div>
      `
      )
      .join("");

    const agenciesHtml = pg.restrictedAgencies
      .map(
        (ag) => `
        <div class="spec-item" style="border-bottom:1px solid #E2E8F0; padding-bottom:6px;">
          <span class="spec-label">🏛️ ${escapeHtml(ag.item)}</span>
          <span class="spec-value">หน่วยงานอนุญาต: ${escapeHtml(ag.agency)}</span>
        </div>
      `
      )
      .join("");

    container.innerHTML = `
      <div class="section-heading">🚫 คู่มือคัดกรองสิ่งของต้องห้าม & ของเหลว/พระเครื่อง</div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${escapeHtml(pg.strictBanEpacketUsEu.title)}</div>
          <span class="badge badge-red">ปรับขั้นต่ำ 3,100 บ.</span>
        </div>
        <div style="background:#FEF2F2; border:1.5px solid #EF4444; border-radius:10px; padding:10px; font-size:13px; color:#7F1D1D; margin-bottom:10px; font-weight:600;">
          ⚠️ ${escapeHtml(pg.strictBanEpacketUsEu.penalty)}
        </div>
        <div style="font-size:13.5px; font-weight:700; color:var(--thp-navy); margin-bottom:6px;">
          รายการสิ่งของต้องห้าม 14 หมวด (ต้องให้ลูกค้าติ๊กใบ Checklist และเปิดตรวจ 100%):
        </div>
        <ul class="notes-list">${strictItemsHtml}</ul>
        <div style="background:#ECFDF5; border:1.5px solid #10B981; border-radius:10px; padding:10px; font-size:13px; color:#065F46; margin-top:10px; font-weight:600;">
          ${escapeHtml(pg.strictBanEpacketUsEu.alternativeForFood)}
        </div>
        <div class="ref-foot">📄 อ้างอิง: ปณท บร.(จร.1)/1921 ลว. 11 ส.ค. 2569 และคู่มือ ePacket Customs Compliance Directive</div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">🧴 เกณฑ์ของเหลว ยาดม เครื่องสำอาง และพระเครื่อง ที่อนุญาตให้ส่งได้</div>
          <span class="badge badge-emerald">ข้อยกเว้นที่ส่งได้</span>
        </div>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">
          สำหรับบริการ ePacket US (LA/LI) และ ePacket DDP ยุโรป (LE) อนุญาตให้ฝากส่งรายการต่อไปนี้ได้ตามปริมาณที่กำหนด:
        </p>
        <div class="spec-grid">${exceptionsHtml}</div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">🔋 กฎการส่งแบตเตอรี่ น้ำแข็งแห้ง และสินค้าอันตราย (เฉพาะบริการที่รองรับ)</div>
          <span class="badge badge-amber">Courier Post Plus</span>
        </div>
        <ul class="notes-list">
          <li class="critical"><strong>บริการไปรษณีย์ทั่วไป (EMS World / ePacket / ลงทะเบียน / พัสดุ):</strong> <strong>ห้ามส่งแบตเตอรี่และพาวเวอร์แบงก์ทุกชนิด</strong> เนื่องจากเป็นสิ่งของต้องห้ามทางอากาศ</li>
          <li class="good"><strong>บริการ Courier Post Plus (UPS - รหัส FC):</strong> สามารถรับฝากสิ่งของพิเศษได้ตามเงื่อนไขดังนี้:
            <br>• <strong>แบตเตอรี่ลิเธียม (UN3091 / UN3481 ที่ติดตั้งอยู่ในอุปกรณ์):</strong> ส่งได้ไม่เกิน 2 ชิ้นต่อกล่อง (ไม่เสียค่าธรรมเนียมเพิ่ม) หากเกิน 2 ชิ้น/กล่อง ต้องเสียค่าธรรมเนียมพิเศษ
            <br>• <strong>น้ำแข็งแห้ง (Dry Ice - เพื่อแช่เย็นสิ่งของที่ไม่เป็นอันตราย):</strong> มีค่าบริการเพิ่มเติม 200 บาท/ชิ้น
            <br>• <strong>สินค้าอันตรายในปริมาณจำกัด (Excepted Quantities - EQ):</strong> มีค่าบริการเพิ่มเติม 700 บาท/ชิ้น (ต้องได้รับอนุมัติและตรวจเอกสาร MSDS ก่อน)
          </li>
        </ul>
        <div class="ref-foot">📄 อ้างอิง: ปณท รร.(ปร.3)/3497 (บริการ Courier Post Plus)</div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">🏛️ หน่วยงานออกใบอนุญาตสำหรับสิ่งของต้องกำกัดขาออก</div>
          <span class="badge badge-slate">อ้างอิงศุลกากร</span>
        </div>
        <div class="spec-grid">${agenciesHtml}</div>
      </div>
    `;
  }

  // 5. ระบบคำนวณสถานะวันเวลาโปรโมชั่นอัตโนมัติ (ใช้งานอยู่ / ยังไม่ถึงวันเริ่ม / หมดอายุแล้ว)
  function evaluatePromoTiming(p) {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = p.startDate ? new Date(p.startDate + "T00:00:00") : null;
    const end = p.endDate ? new Date(p.endDate + "T23:59:59") : null;
    const endMidnight = p.endDate ? new Date(p.endDate + "T00:00:00") : null;

    if (start && todayMidnight < start) {
      const daysUntil = Math.ceil((start - todayMidnight) / (1000 * 60 * 60 * 24));
      return {
        state: "UPCOMING",
        bannerText: `⏳ ยังไม่ถึงเวลาเริ่มแคมเปญ! (อีก ${daysUntil} วัน — เริ่มใช้ได้ ${p.period})`,
        subWarning: "🚫 ห้ามกดปุ่มส่วนลดนี้ให้ลูกค้าในตอนนี้เด็ดขาด!",
        badgeText: `⏳ ยังไม่เริ่ม (อีก ${daysUntil} วัน)`,
        badgeClass: "badge-red"
      };
    }

    if (end && now > end) {
      const daysAgo = Math.floor((todayMidnight - endMidnight) / (1000 * 60 * 60 * 24));
      return {
        state: "EXPIRED",
        bannerText: `🔴 หมดอายุแล้ว! (สิ้นสุดเมื่อ ${p.period}${daysAgo > 0 ? ` — ผ่านมาแล้ว ${daysAgo} วัน` : ""})`,
        subWarning: "⛔ สิ้นสุดระยะเวลาแคมเปญแล้ว ห้ามกดให้ลูกค้าเด็ดขาด!",
        badgeText: "❌ หมดอายุแล้ว",
        badgeClass: "badge-red"
      };
    }

    // กรณีใช้งานได้ในขณะนี้ (ACTIVE)
    if (endMidnight && p.endDate !== "2099-12-31") {
      const daysLeft = Math.ceil((endMidnight - todayMidnight) / (1000 * 60 * 60 * 24)) + 1;
      return {
        state: "ACTIVE",
        bannerText: `🟢 มีให้ใช้อยู่ตอนนี้! (เหลือเวลาอีก ${daysLeft} วัน — ถึง ${p.period})`,
        subWarning: "",
        badgeText: `✅ ใช้ได้ตอนนี้ (เหลือ ${daysLeft} วัน)`,
        badgeClass: "badge-emerald"
      };
    }

    return {
      state: "ACTIVE",
      bannerText: `🟢 มีให้ใช้อยู่ตอนนี้! (สิทธิมาตรฐาน ใช้ได้ต่อเนื่องตลอดปี)`,
      subWarning: "",
      badgeText: "✅ ใช้ได้ตอนนี้",
      badgeClass: "badge-emerald"
    };
  }

  function buildPromoCardHtml(p) {
    const timing = evaluatePromoTiming(p);
    const condHtml = (p.conditions || [])
      .map((c) => `<li class="${c.includes("⚠️") || timing.state !== "ACTIVE" ? "critical" : "good"}">${escapeHtml(c)}</li>`)
      .join("");

    if (timing.state === "UPCOMING") {
      return `
        <div class="card upcoming-card">
          <div class="promo-status-banner upcoming">
            <span>${escapeHtml(timing.bannerText)}</span>
          </div>
          <div class="card-header">
            <div class="card-title" style="color:#78350F;">${escapeHtml(p.title)}</div>
            <span class="badge ${timing.badgeClass}">${escapeHtml(timing.badgeText)}</span>
          </div>
          <div style="font-size:13px; color:#991B1B; font-weight:700; margin-bottom:6px;">
            ${escapeHtml(timing.subWarning)}
          </div>
          <div style="font-size:13px; color:var(--text-muted); margin-bottom:6px;">
            🗓️ <strong>ระยะเวลาที่ใช้ได้จริง:</strong> ${escapeHtml(p.period)} | 👤 <strong>กลุ่มเป้าหมาย:</strong> ${escapeHtml(p.target)}
          </div>
          <div class="pos-btn-badge" style="background:#64748B; color:#E2E8F0; text-decoration:line-through;">
            🔒 ปุ่มใน New CA POS: "${escapeHtml(p.posButton)}" (รอกดเมื่อถึงกำหนด)
          </div>
          <div style="font-size:13px; margin:6px 0;">
            <strong>บริการที่ร่วมรายการ:</strong> ${escapeHtml(p.services.join(", "))}
          </div>
          <ul class="notes-list">${condHtml}</ul>
          <div class="ref-foot">📄 อ้างอิงบันทึก: ${escapeHtml(p.ref)}</div>
        </div>
      `;
    }

    if (timing.state === "EXPIRED") {
      return `
        <div class="card expired-card">
          <div class="promo-status-banner expired">
            <span>${escapeHtml(timing.bannerText)}</span>
          </div>
          <div class="card-header">
            <div class="card-title" style="font-size:15.5px; color:#475569; text-decoration:line-through;">${escapeHtml(p.title)}</div>
            <span class="badge badge-red">❌ หมดอายุแล้ว</span>
          </div>
          <div style="font-size:13px; color:#64748B;">
            🗓️ <strong>ระยะเวลาเดิม:</strong> ${escapeHtml(p.period)}
          </div>
          <div style="font-size:13px; color:#B91C1C; font-weight:700; margin-top:4px;">
            ⛔ ${escapeHtml(p.reason || timing.subWarning)}
          </div>
          <div class="ref-foot">อ้างอิงเดิม: ${escapeHtml(p.ref)}</div>
        </div>
      `;
    }

    // ACTIVE
    return `
      <div class="card" style="border: 2.5px solid #10B981;">
        <div class="promo-status-banner active">
          <span>${escapeHtml(timing.bannerText)}</span>
        </div>
        <div class="card-header">
          <div class="card-title">${escapeHtml(p.title)}</div>
          <span class="badge ${timing.badgeClass}">${escapeHtml(timing.badgeText)}</span>
        </div>
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:6px;">
          🗓️ <strong>ระยะเวลา:</strong> ${escapeHtml(p.period)} | 👤 <strong>กลุ่มเป้าหมาย:</strong> ${escapeHtml(p.target)}
        </div>
        <div class="pos-btn-badge">💻 กดปุ่มใน New CA POS: "${escapeHtml(p.posButton)}"</div>
        <div style="font-size:13px; margin:6px 0;">
          <strong>บริการที่ร่วมรายการ:</strong> ${escapeHtml(p.services.join(", "))}
        </div>
        <ul class="notes-list">${condHtml}</ul>
        <div class="ref-foot">📄 อ้างอิงบันทึก: ${escapeHtml(p.ref)}</div>
      </div>
    `;
  }

  function renderPromosAndContacts() {
    const clockBanner = document.getElementById("promoTodayClockBanner");
    const activeContainer = document.getElementById("activePromosContainer");
    const upcomingContainer = document.getElementById("upcomingPromosContainer");
    const expiredContainer = document.getElementById("expiredPromosContainer");
    const contactsContainer = document.getElementById("contactsContainer");

    if (clockBanner) {
      const now = new Date();
      const thaiDateStr = now.toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      clockBanner.innerHTML = `
        <h3 style="color:#1E40AF;">🕒 เช็คสถานะวัน-เวลาแคมเปญอัตโนมัติ (วันนี้: ${escapeHtml(thaiDateStr)})</h3>
        <p style="color:#1E3A8A;">
          • <strong>🟢 กรอบสีเขียวเข้ม (มีให้ใช้อยู่ตอนนี้):</strong> กดให้ส่วนลดลูกค้าได้ทันที พร้อมนับถอยหลังจำนวนวันที่เหลือ<br>
          • <strong>⏳ กรอบสีส้มจาง + แถบเตือนสีแดง (ยังไม่ถึงวันเริ่ม):</strong> ปุ่มส่วนลดถูกขีดฆ่าล็อกไว้ ห้ามเพิ่งกดจนกว่าจะถึงวันเริ่ม<br>
          • <strong>🔴 กรอบสีเทาจาง + แถบสีแดงขีดฆ่า (หมดอายุแล้ว):</strong> สิ้นสุดระยะเวลาแล้ว แสดงแบบสีจางเพื่อป้องกันเจ้าหน้าที่กดผิด
        </p>
      `;
    }

    const allPromos = [
      ...(DATA.promotions.active || []),
      ...(DATA.promotions.expired || [])
    ];

    const activeList = [];
    const upcomingList = [];
    const expiredList = [];

    allPromos.forEach((p) => {
      const t = evaluatePromoTiming(p);
      if (t.state === "ACTIVE") activeList.push(p);
      else if (t.state === "UPCOMING") upcomingList.push(p);
      else expiredList.push(p);
    });

    if (activeContainer) {
      activeContainer.innerHTML = activeList.map((p) => buildPromoCardHtml(p)).join("");
    }

    if (upcomingContainer) {
      upcomingContainer.innerHTML =
        upcomingList.length > 0
          ? upcomingList.map((p) => buildPromoCardHtml(p)).join("")
          : `<div class="card"><div style="color:var(--text-muted); font-size:13.5px;">ไม่มีแคมเปญที่รอเริ่มในขณะนี้</div></div>`;
    }

    if (expiredContainer) {
      expiredContainer.innerHTML = expiredList.map((p) => buildPromoCardHtml(p)).join("");
    }

    if (contactsContainer) {
      contactsContainer.innerHTML = `
        <div class="card">
          <div class="spec-grid" style="margin-bottom:0;">
            ${DATA.contacts
              .map(
                (c) => `
              <div class="spec-item" style="border-bottom:1px solid #E2E8F0; padding-bottom:8px;">
                <span class="spec-label">${escapeHtml(c.name)}</span>
                <span class="spec-value" style="font-size:15px; font-weight:700; color:var(--thp-red);">${escapeHtml(c.phone)}</span>
                <span class="spec-value" style="font-size:12px; color:var(--text-muted);">${escapeHtml(c.note)}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }
  }

  // 6. เครื่องคำนวณขนาด & น้ำหนักปริมาตร (Volumetric & Size Checker)
  function setupCalculator() {
    const btn = document.getElementById("runCalcBtn");
    const out = document.getElementById("calcResultBox");
    if (!btn || !out) return;

    btn.addEventListener("click", () => {
      const w = parseFloat(document.getElementById("calcWeight").value) || 0;
      const d1 = parseFloat(document.getElementById("calcL").value) || 0;
      const d2 = parseFloat(document.getElementById("calcW").value) || 0;
      const d3 = parseFloat(document.getElementById("calcH").value) || 0;

      if (w <= 0 && d1 <= 0 && d2 <= 0 && d3 <= 0) {
        out.style.display = "block";
        out.innerHTML = `<div style="color:#B91C1C; font-weight:600;">กรุณากรอกน้ำหนักและขนาดด้านทั้ง 3 ด้าน (ซม.) เพื่อคำนวณ</div>`;
        return;
      }

      // เรียงลำดับด้านจากมากไปน้อย: longest >= mid >= shortest
      const dims = [d1, d2, d3].sort((a, b) => b - a);
      const longest = dims[0];
      const mid = dims[1];
      const shortest = dims[2];

      const sum3 = longest + mid + shortest;
      const girthPlusLen = longest + 2 * (mid + shortest); // ยาวสุด + รอบตัวห่อ (2xกว้าง + 2xสูง)
      const volWeight = (longest * mid * shortest) / 5000;
      const chargeableWeight = Math.max(w, volWeight);

      // ตรวจสอบเงื่อนไขแต่ละบริการ
      const checks = [];

      // 1. ePacket DDP (EU 27 ประเทศ) - เกณฑ์ใหม่ 1 พ.ย. 69: นน.<=5กก., ยาวสุด<=60, อีก2ด้าน<=40และ<=30, รวม3ด้าน<=130
      const passEuWeight = w > 0 && w <= 5;
      const passEuSize = longest <= 60 && mid <= 40 && shortest <= 30 && sum3 <= 130;
      checks.push({
        name: "ePacket DDP (EU 27 ประเทศ - LE)",
        ok: passEuWeight && passEuSize,
        detail:
          passEuWeight && passEuSize
            ? "✅ ผ่านเกณฑ์ขนาดและน้ำหนัก (นน. ≤ 5 กก., ด้านยาวสุด ≤ 60 ซม., ด้านรอง ≤ 40×30 ซม., ก+ย+ส ≤ 130 ซม.)"
            : `❌ ไม่ผ่านเกณฑ์ (${!passEuWeight ? "น้ำหนักต้องไม่เกิน 5 กก. " : ""}${!passEuSize ? "ขนาดต้องไม่เกิน 60×40×30 ซม. และ ก+ย+ส ไม่เกิน 130 ซม." : ""})`
      });

      // 2. ePacket US (LA/LI): นน.<=5กก., ยาวสุด<=55, รวม3ด้าน<=100
      const passUsWeight = w > 0 && w <= 5;
      const passUsSize = longest <= 55 && sum3 <= 100;
      checks.push({
        name: "ePacket สหรัฐอเมริกา (LA/LI)",
        ok: passUsWeight && passUsSize,
        detail:
          passUsWeight && passUsSize
            ? "✅ ผ่านเกณฑ์ขนาดและน้ำหนัก (นน. ≤ 5 กก., ยาวสุด ≤ 55 ซม., ก+ย+ส ≤ 100 ซม.)"
            : `❌ ไม่ผ่านเกณฑ์ (${!passUsWeight ? "น้ำหนักต้องไม่เกิน 5 กก. " : ""}${!passUsSize ? "ยาวสุดต้องไม่เกิน 55 ซม. และ ก+ย+ส ไม่เกิน 100 ซม." : ""})`
      });

      // 3. ePacket ปลายทางอื่นๆ (LP/LX): นน.<=2กก. (UK <=5กก.), ยาวสุด<=60, รวม3ด้าน<=90
      const passOtherSize = longest <= 60 && sum3 <= 90;
      checks.push({
        name: "ePacket ปลายทางอื่นๆ (LP/LX)",
        ok: w > 0 && w <= 2 && passOtherSize,
        detail:
          w > 0 && w <= 2 && passOtherSize
            ? "✅ ผ่านเกณฑ์ (นน. ≤ 2 กก., ยาวสุด ≤ 60 ซม., ก+ย+ส ≤ 90 ซม.)"
            : w > 2 && w <= 5 && passOtherSize
            ? "⚠️ ส่งได้เฉพาะปลายทาง UK (ไม่เกิน 5 กก.) ส่วนประเทศอื่นต้องไม่เกิน 2 กก."
            : "❌ ไม่ผ่านเกณฑ์ (นน. ≤ 2 กก., ยาวสุด ≤ 60 ซม., ก+ย+ส ≤ 90 ซม.)"
      });

      // 4. EMS World: นน.<=20/30กก., ยาวสุด<=150, ยาวสุด+รอบตัวห่อ<=300
      const passEms = w > 0 && w <= 30 && longest <= 150 && girthPlusLen <= 300;
      checks.push({
        name: "EMS World (Package)",
        ok: passEms,
        detail: passEms
          ? `✅ ผ่านเกณฑ์มาตรฐาน (ยาวสุด ≤ 150 ซม., ยาว+รอบตัวห่อ ${girthPlusLen.toFixed(1)} ≤ 300 ซม.) ${longest > 105 || girthPlusLen > 200 || w > 20 ? "⚠️ ระวังบางประเทศ เช่น ออสเตรเลีย/สเปน/เดนมาร์ก จำกัดยาวสุด 105 ซม. และรอบตัวห่อ 200 ซม. นน. 20 กก." : ""}`
          : "❌ เกินขนาดมาตรฐาน EMS World (ยาวสุด 150 ซม. / ยาว+รอบตัวห่อ 300 ซม. / นน. 30 กก.)"
      });

      // 5. Courier Post Plus: ปกติ <=30กก., ยาว<=120, ด้านรอง<=75, ยาว+รอบตัวห่อ<=300 | เกินเกณฑ์เสีย 700 บาท (นน.>30-50กก., ยาว>120-270)
      const passCppNormal = w > 0 && w <= 30 && longest <= 120 && mid <= 75 && shortest <= 75 && girthPlusLen <= 300;
      const passCppOversize = w > 0 && w <= 50 && longest <= 270 && girthPlusLen <= 400;
      checks.push({
        name: "Courier Post Plus (ใช้น้ำหนักคิดราคา " + chargeableWeight.toFixed(2) + " กก.)",
        ok: passCppOversize,
        detail: passCppNormal
          ? "✅ ผ่านเกณฑ์ปกติ (ไม่ต้องเสียค่า Surcharge 700 บาท)"
          : passCppOversize
          ? "⚠️ รับฝากได้ แต่ต้องเก็บค่า Overweight/Oversize Surcharge เพิ่ม 700 บาท! (ติ๊ก Yes ช่อง Oversize Surcharge ใน POS)"
          : "❌ เกินขนาด/น้ำหนักสูงสุดของ Courier Post Plus (รับได้สูงสุด 50 กก./กล่อง และยาวสุด 270 ซม.)"
      });

      out.style.display = "block";
      out.innerHTML = `
        <div class="spec-grid" style="background:#EFF6FF; border-color:#93C5FD; margin-bottom:10px;">
          <div class="spec-item">
            <span class="spec-label">📏 ผลรวม 3 ด้าน (ก+ย+ส): <strong>${sum3.toFixed(1)} ซม.</strong> | ยาวสุด + รอบตัวห่อ (L + 2W + 2H): <strong>${girthPlusLen.toFixed(1)} ซม.</strong></span>
          </div>
          <div class="spec-item">
            <span class="spec-label">⚖️ น้ำหนักชั่งจริง: <strong>${w.toFixed(2)} กก.</strong> | น้ำหนักปริมาตร (ก×ย×ส ÷ 5,000): <strong>${volWeight.toFixed(2)} กก.</strong></span>
            <span class="spec-value" style="color:var(--thp-red-dark); font-weight:700;">
              👉 สำหรับ Courier Post / Courier Post Plus คิดราคาที่น้ำหนัก: ${chargeableWeight.toFixed(2)} กก. (${volWeight > w ? "ใช้น้ำหนักปริมาตรเพราะมากกว่าน้ำหนักจริง" : "ใช้น้ำหนักชั่งจริง"})
            </span>
          </div>
        </div>
        <ul class="notes-list">
          ${checks
            .map(
              (c) => `
            <li class="${c.ok ? "good" : "critical"}">
              <strong>${escapeHtml(c.name)}:</strong> ${escapeHtml(c.detail)}
            </li>
          `
            )
            .join("")}
        </ul>
      `;
    });
  }

  // 7. ระบบค้นหาด่วนทั่วทั้งแอป (Global Instant Search)
  function setupGlobalSearch() {
    const input = document.getElementById("globalSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const closeBtn = document.getElementById("closeSearchBtn");
    const searchSection = document.getElementById("searchResultsSection");
    const resultsContainer = document.getElementById("searchResultsContainer");
    const tabSections = document.querySelectorAll(".tab-section");

    if (!input || !searchSection || !resultsContainer) return;

    function hideSearch() {
      input.value = "";
      clearBtn.style.display = "none";
      searchSection.style.display = "none";
      const activeNav = document.querySelector(".nav-btn.active");
      const activeTabId = activeNav ? activeNav.getAttribute("data-tab") : "tab-quick";
      tabSections.forEach((sec) => {
        sec.classList.toggle("active", sec.id === activeTabId);
      });
    }

    clearBtn.addEventListener("click", hideSearch);
    if (closeBtn) closeBtn.addEventListener("click", hideSearch);

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        hideSearch();
        return;
      }

      clearBtn.style.display = "flex";
      tabSections.forEach((sec) => sec.classList.remove("active"));
      searchSection.style.display = "block";

      const matches = [];

      // 0. ค้นหาในฐานข้อมูลรายประเทศโดยตรง (Country Directory - รองรับทั้งชื่ออังกฤษ ชื่อไทย และรหัส 2 ตัวอักษร เช่น Korea, KR, เกาหลี, Japan, JP, UK, US, Germany)
      (DATA.countryDirectory || []).forEach((cty) => {
        const hay = [
          cty.code,
          cty.th,
          cty.en,
          cty.zone,
          cty.emsMaxWeight,
          cty.emsSize,
          cty.emsEta,
          cty.epacketRule,
          cty.courierPlusRule,
          cty.notes
        ]
          .join(" ")
          .toLowerCase();

        if (hay.includes(q)) {
          matches.push(`
            <div class="card" style="border: 2px solid #2563EB;">
              <div class="card-header">
                <div>
                  <span class="prefix-tag" style="background:#1E40AF; color:#FDE047;">รหัสประเทศ: ${escapeHtml(cty.code)}</span>
                  <div class="card-title">🏳️ ${escapeHtml(cty.th)} — ${escapeHtml(cty.en)}</div>
                </div>
                <span class="badge badge-blue">${escapeHtml(cty.zone)}</span>
              </div>
              <div class="spec-grid">
                <div class="spec-item">
                  <span class="spec-label">📦 บริการ ePacket:</span>
                  <span class="spec-value" style="font-weight:600; color:${cty.epacketRule.includes("❌") || cty.epacketRule.includes("🚨") ? "#B91C1C" : "#047857"};">${escapeHtml(cty.epacketRule)}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">🚀 บริการ EMS World:</span>
                  <span class="spec-value"><strong>น้ำหนักสูงสุด:</strong> ${escapeHtml(cty.emsMaxWeight)} | <strong>ขนาด/เงื่อนไข:</strong> ${escapeHtml(cty.emsSize)} | <strong>ระยะเวลานำจ่าย:</strong> ${escapeHtml(cty.emsEta)}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">🚛 บริการ Courier Post Plus / Courier Post:</span>
                  <span class="spec-value">${escapeHtml(cty.courierPlusRule)}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">📌 ข้อสังเกตสำคัญหน้าเคาน์เตอร์:</span>
                  <span class="spec-value" style="color:#92400E; font-weight:600;">${escapeHtml(cty.notes)}</span>
                </div>
              </div>
            </div>
          `);
        }
      });

      // ค้นหาในบริการ (Services)
      DATA.services.forEach((srv) => {
        const hay = [
          srv.name,
          srv.prefix,
          srv.partner,
          srv.maxWeight,
          srv.maxSize,
          srv.allowedBoxes,
          srv.maxValue,
          srv.indemnity,
          srv.dpostInterMode || "",
          ...(srv.requiredForms || []),
          ...(srv.survivalGuide || []),
          srv.customsRule,
          ...srv.criticalNotes
        ]
          .join(" ")
          .toLowerCase();

        if (hay.includes(q)) {
          const allNotes = [
            ...(srv.requiredForms || []),
            ...(srv.survivalGuide || []),
            ...srv.criticalNotes
          ];
          const matchedNotes = allNotes.filter((n) => n.toLowerCase().includes(q));
          const notesToShow = matchedNotes.length > 0 ? matchedNotes : allNotes.slice(0, 4);
          matches.push(`
            <div class="card">
              <div class="card-header">
                <div>
                  <span class="prefix-tag">${escapeHtml(srv.prefix)}</span>
                  <div class="card-title">${escapeHtml(srv.name)}</div>
                </div>
                <span class="badge badge-${escapeHtml(srv.badgeColor)}">บริการ</span>
              </div>
              ${
                srv.dpostInterMode
                  ? `<div style="background:#FEF2F2; border:1px solid #EF4444; border-radius:8px; padding:8px; margin-bottom:8px; font-size:13px; color:#991B1B; font-weight:600;">💻 <strong>D-Post Inter:</strong> ${escapeHtml(srv.dpostInterMode)}</div>`
                  : ""
              }
              <div class="spec-grid">
                <div class="spec-item"><span class="spec-label">⚖️ น้ำหนักสูงสุด:</span> <span class="spec-value">${escapeHtml(srv.maxWeight)}</span></div>
                <div class="spec-item"><span class="spec-label">📏 ขนาดสูงสุด:</span> <span class="spec-value">${escapeHtml(srv.maxSize)}</span></div>
                <div class="spec-item"><span class="spec-label">🛡️ อัตราชดใช้:</span> <span class="spec-value">${escapeHtml(srv.indemnity)}</span></div>
              </div>
              <ul class="notes-list">
                ${notesToShow.map((n) => `<li class="${n.includes("🚨") || n.includes("🛡️") ? "critical" : "good"}">${escapeHtml(n)}</li>`).join("")}
              </ul>
            </div>
          `);
        }
      });

      // ค้นหาในประเทศปลายทาง (Destinations)
      DATA.destinations.forEach((d) => {
        const hay = [
          d.zone,
          d.nonEuWarning || "",
          ...d.countries,
          ...d.allowedForDocs,
          ...d.allowedForGoods,
          ...d.mandatoryRules
        ]
          .join(" ")
          .toLowerCase();

        if (hay.includes(q)) {
          const matchedCountries = d.countries.filter((c) => c.toLowerCase().includes(q));
          matches.push(`
            <div class="card">
              <div class="card-header">
                <div class="card-title">${escapeHtml(d.zone)}</div>
                <span class="badge badge-blue">โซนปลายทาง</span>
              </div>
              ${
                matchedCountries.length > 0
                  ? `<div style="margin-bottom:8px; font-size:13.5px; color:#047857; font-weight:700;">🎯 ประเทศที่ตรงกับคำค้น: ${escapeHtml(matchedCountries.join(", "))}</div>`
                  : ""
              }
              <div style="font-size:13px; font-weight:700; color:var(--thp-navy);">บริการส่งสิ่งของที่ใช้ได้:</div>
              <ul class="notes-list">
                ${d.allowedForGoods.map((g) => `<li class="good">${escapeHtml(g)}</li>`).join("")}
              </ul>
              <div style="font-size:13px; font-weight:700; color:#991B1B; margin-top:6px;">กฎเหล็กปลายทางนี้:</div>
              <ul class="notes-list">
                ${d.mandatoryRules.map((r) => `<li class="critical" style="white-space:pre-line;">${escapeHtml(r)}</li>`).join("")}
              </ul>
            </div>
          `);
        }
      });

      // ค้นหาในสิ่งของต้องห้าม & ข้อยกเว้น
      const pg = DATA.prohibitedGuide;
      const prohibHay = [
        pg.strictBanEpacketUsEu.title,
        pg.strictBanEpacketUsEu.penalty,
        pg.strictBanEpacketUsEu.alternativeForFood,
        ...pg.strictBanEpacketUsEu.items,
        ...pg.strictBanEpacketUsEu.allowedExceptions.map((e) => `${e.category} ${e.limit} ${e.condition}`)
      ]
        .join(" ")
        .toLowerCase();

      if (prohibHay.includes(q)) {
        matches.push(`
          <div class="card">
            <div class="card-header">
              <div class="card-title">🚫 เกณฑ์สิ่งของต้องห้าม / ของเหลว / อาหาร (ePacket US & EU)</div>
              <span class="badge badge-red">ข้อห้ามสำคัญ</span>
            </div>
            <div style="font-size:13px; color:#7F1D1D; font-weight:600; margin-bottom:8px;">
              ${escapeHtml(pg.strictBanEpacketUsEu.penalty)}
            </div>
            <div style="font-size:13px; color:#065F46; font-weight:600; margin-bottom:8px;">
              ${escapeHtml(pg.strictBanEpacketUsEu.alternativeForFood)}
            </div>
            <ul class="notes-list">
              ${pg.strictBanEpacketUsEu.allowedExceptions
                .map((e) => `<li class="good"><strong>${escapeHtml(e.category)}:</strong> ${escapeHtml(e.limit)} (${escapeHtml(e.condition)})</li>`)
                .join("")}
            </ul>
          </div>
        `);
      }

      // ค้นหาในส่วนลด/โปรโมชั่น
      DATA.promotions.active.forEach((p) => {
        const hay = [p.title, p.period, p.target, p.posButton, ...p.services, ...p.conditions].join(" ").toLowerCase();
        if (hay.includes(q)) {
          matches.push(buildPromoCardHtml(p));
        }
      });

      DATA.promotions.expired.forEach((ex) => {
        const hay = [ex.title, ex.period, ex.reason].join(" ").toLowerCase();
        if (hay.includes(q)) {
          matches.push(buildPromoCardHtml(ex));
        }
      });

      // ค้นหาในแบบพิมพ์และเอกสาร (Printable Docs)
      (DATA.printableDocs || []).forEach((doc) => {
        const hay = [doc.title, doc.category, doc.serviceTag, doc.description, doc.updated].join(" ").toLowerCase();
        if (hay.includes(q)) {
          matches.push(buildDocCardHtml(doc));
        }
      });

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div class="card" style="text-align:center; padding:24px;">
            <div style="font-size:15px; font-weight:700; color:var(--text-muted);">ไม่พบข้อมูลที่ตรงกับ "${escapeHtml(input.value)}"</div>
            <p style="font-size:13px; color:var(--text-muted); margin-top:6px;">ลองค้นหาด้วยคำว่า: ยุโรป, อเมริกา, มอลตา, เยอรมนี, อาหาร, ยาดม, พระเครื่อง, PID, LOA, แบบพิมพ์, กล่อง, ส่วนลด</p>
          </div>
        `;
      } else {
        resultsContainer.innerHTML = matches.join("");
        attachDocActionEvents(resultsContainer);
      }
    });
  }

  // 7.5 ศูนย์รวมแบบพิมพ์ เอกสารประกอบการรับฝาก (แชร์ / ดาวน์โหลด / สั่งพิมพ์ A4)
  function getPrintableTemplateHtml(templateType) {
    const baseStyle = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
        body { font-family: 'Sarabun', sans-serif; color: #0F172A; margin: 18mm; line-height: 1.45; font-size: 13.5px; }
        h1 { font-size: 18px; margin: 0 0 4px; color: #B91C1C; }
        h2 { font-size: 14.5px; margin: 0 0 10px; color: #1E293B; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #334155; padding: 6px 8px; text-align: left; font-size: 12.5px; vertical-align: top; }
        th { background: #F1F5F9; font-weight: 700; }
        .box-choice { border: 2px solid #0F172A; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
        .sig-row { display: flex; justify-content: space-between; margin-top: 24px; gap: 20px; }
        .sig-box { flex: 1; border: 1px solid #64748B; padding: 12px; border-radius: 8px; text-align: center; }
        .stamp-cut { border: 3px solid #B91C1C; padding: 10px 18px; display: inline-block; font-weight: 700; font-size: 20px; margin: 8px; color: #B91C1C; letter-spacing: 1px; }
        @media print { .no-print { display: none !important; } body { margin: 10mm; } }
      </style>
    `;

    if (templateType === "CHECKLIST_14") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>Checklist 14 ข้อ ePacket US & DDP EU</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#FEF2F2; padding:10px; border:1px solid #EF4444; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>พร้อมพิมพ์ขนาด A4:</strong> ให้ผู้ฝากส่งติ๊กและลงนามก่อนรับฝาก ePacket US (LA/LI) และ ePacket DDP ยุโรป (LE)</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์หน้านี้ทันที</button>
        </div>
        <h1>บริษัท ไปรษณีย์ไทย จำกัด (THAILAND POST)</h1>
        <h2>แบบตรวจสอบรายการสิ่งของต้องห้ามฝากส่งบริการ ePacket USA (LA/LI) และ ePacket DDP ยุโรป 27 ประเทศ (LE)</h2>
        <p style="margin:4px 0;"><strong>สิ่งของที่จะฝากส่งของท่าน มีรายการของต้องห้ามต่อไปนี้หรือไม่? (DOES YOUR PARCEL CONTAIN ANY PROHIBITED ITEMS?)</strong></p>
        <table>
          <thead>
            <tr><th style="width:40px;">ตรวจ</th><th>รายการสิ่งของต้องห้าม (Prohibited Items Checklist - 14 หมวด)</th><th style="width:40px;">ตรวจ</th><th>รายการสิ่งของต้องห้าม (Prohibited Items Checklist)</th></tr>
          </thead>
          <tbody>
            <tr><td>☐</td><td><strong>1. ยาเสพติด กัญชา กระท่อม และยาสามัญ/ยารักษาโรค</strong><br>(Narcotics & Medicine)</td><td>☐</td><td><strong>8. อาวุธ สิ่งเทียมอาวุธ วัตถุมีคม มีด ปืนปลอม</strong><br>(Weapons, Imitation Firearms, Sharp object)</td></tr>
            <tr><td>☐</td><td><strong>2. สัตว์มีชีวิต ซากพืช ซากสัตว์</strong><br>(Live Animals, Plant materials and Animal remains)</td><td>☐</td><td><strong>9. องค์พระ เทวรูป และวัตถุโบราณ</strong> (ยกเว้นพระเครื่องห้อยคอรวมไม่เกิน 500 กรัม/กล่อง)</td></tr>
            <tr><td>☐</td><td><strong>3. อาหารสดและของเน่าเสียง่าย</strong><br>(Fresh Food & Perishables)</td><td>☐</td><td><strong>10. วัตถุไวไฟทุกชนิด สเปรย์ น้ำหอมที่มีแอลกอฮอล์</strong><br>(All types of Flammable Substances)</td></tr>
            <tr><td>☐</td><td><strong>4. วัตถุลามกอนาจาร</strong> (Pornography)</td><td>☐</td><td><strong>11. แม่เหล็ก และลำโพงแม่เหล็ก</strong> (Magnet)</td></tr>
            <tr><td>☐</td><td><strong>5. เงินสด ทองคำ บัตรเครดิต/เดบิต</strong><br>(Bank Notes, Gold Bullion, Credit/Debit card)</td><td>☐</td><td><strong>12. ไม้ พืชพันธุ์ ส่วนของพืช และเมล็ดพันธุ์พืช</strong><br>(Wood, Plant, Part of plants and Seeds)</td></tr>
            <tr><td>☐</td><td><strong>6. สิ่งของละเมิดลิขสิทธิ์ / ของปลอมแบรนด์เนม</strong><br>(Copyright-infringing items)</td><td>☐</td><td><strong>13. สารอันตรายและเชื้อโรค</strong><br>(Hazardous and Infectious Substances)</td></tr>
            <tr><td>☐</td><td><strong>7. แบตเตอรี่ และแบตเตอรี่ลิเธียม-ไอออนทุกชนิด</strong><br>(Battery and Lithium-Ion Battery)</td><td>☐</td><td><strong>14. 🚫 อาหาร เครื่องดื่ม ขนม ลูกอม ช็อกโกแลต ชา กาแฟ เครื่องปรุง ข้าว แป้ง ถั่ว ผลไม้อบแห้ง เนื้อสัตว์/อาหารทะเลแปรรูป นมผง โปรตีนผง วิตามิน อาหารเสริม และอาหารสัตว์ทุกชนิด!</strong></td></tr>
          </tbody>
        </table>
        <div class="box-choice" style="text-align:center; font-size:14px; font-weight:700;">
          พัสดุของคุณมีรายการสิ่งของต้องห้ามตามที่ระบุข้างต้นหรือไม่?<br><br>
          ☐ <strong>มี (YES - ไม่สามารถฝากส่งได้)</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ <strong>ไม่มี (NO - สามารถฝากส่งได้)</strong>
        </div>
        <div style="background:#FFFBEB; border:1.5px solid #D97706; padding:8px 10px; border-radius:6px; font-size:12px;">
          ⚠️ <strong>คำเตือนสำคัญ:</strong> โปรดสำแดงสินค้าให้ถูกต้องและชัดเจน (ห้ามใช้คำกำกวม เช่น Gift, Sample, Accessories, Daily Necessities) หากศุลกากรหรือผู้ขนส่งตรวจพบการสำแดงเท็จหรือพบสิ่งของต้องห้าม พัสดุจะถูกอายัด/ส่งกลับ/ทำลาย โดย<strong>ผู้ฝากส่งต้องรับผิดชอบค่าปรับขั้นต่ำ 3,100 บาท/กล่อง</strong> และไม่คืนค่าฝากส่ง/ค่าภาษีทุกกรณี (อ้างอิง ปณท บร.(จร.1)/1921)
        </div>
        <div class="sig-row">
          <div class="sig-box">
            <strong>สำหรับผู้ฝากส่ง (Sender)</strong><br><br>
            หมายเลขสิ่งของ (Tracking No.): .......................................................<br><br>
            ลงชื่อผู้ฝากส่ง: ....................................................................................<br>
            (....................................................................................)<br>
            เบอร์โทรศัพท์: .......................................... วันที่: ........../........../2569
          </div>
          <div class="sig-box">
            <strong>สำหรับเจ้าหน้าที่รับฝาก ปณท</strong><br><br>
            ☐ เปิดตรวจสอบสิ่งของภายในเรียบร้อยแล้ว<br>
            ☐ ประทับตรา/เขียน <strong>"Content Checked"</strong> บนกล่องแล้ว<br>
            ☐ (กรณี EU) รับชำระภาษี Pay@Post 84415 และเขียน <strong>"Duties Paid"</strong> แล้ว<br><br>
            ปณ.ต้นทาง: ................................................ วันที่: ........../........../2569
          </div>
        </div>
      </body></html>`;
    }

    if (templateType === "LOA_COURIER_POST") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>หนังสือยินยอม LOA - บริการ Courier Post</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#EFF6FF; padding:10px; border:1px solid #2563EB; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>พร้อมพิมพ์ A4 (พิมพ์ 2 ฉบับ):</strong> ติดหน้ากล่องในซองพลาสติกใส 1 ฉบับ + เก็บเป็นหลักฐานที่ ปณ.ต้นทาง 1 ฉบับ</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์ใบ LOA (2 ฉบับ)</button>
        </div>
        <h1>หนังสือแจ้งความประสงค์และยินยอมรับผิดชอบค่าใช้จ่าย (LOA) — บริการ Courier Post</h1>
        <h2>Letter of Authorization (LOA) for Customs Duties, Taxes & Undeliverable Shipment (มีผลบังคับใช้ตั้งแต่วันที่ 7 พฤษภาคม 2569 ตามบันทึก ปณท บร.(จร.2)/870)</h2>
        <p>เรียน บริษัท ไปรษณีย์ไทย จำกัด (ปณท) / พันธมิตรผู้ให้บริการขนส่งระหว่างประเทศ</p>
        <p>ข้าพเจ้า (ชื่อผู้ฝากส่ง): ................................................................................................................... โทรศัพท์: .................................................................<br>
        ได้ฝากส่งสิ่งของบริการ <strong>Courier Post</strong> หมายเลขสิ่งของ (Tracking No.): <strong>.........................................................................................................</strong><br>
        ไปยังประเทศปลายทาง: ......................................................................................... (1 ใบ LOA ต่อ 1 Shipment / Tracking No.)</p>
        <p><strong>ข้าพเจ้ารับทราบและยินยอมรับผิดชอบค่าภาษีอากรและค่าใช้จ่ายอื่นๆ ที่อาจเกิดขึ้น ณ ประเทศปลายทาง โดยหากผู้รับปลายทางปฏิเสธการชำระค่าภาษีอากร หรือไม่สามารถนำจ่ายได้ ข้าพเจ้าขอเลือกแนวทางดำเนินการดังนี้ (โปรดเลือกเพียง 1 ข้อ):</strong></p>
        <div class="box-choice">
          <div style="font-size:15px; font-weight:700; color:#B91C1C;">☐ ทางเลือกที่ 1: DISPOSAL (ทำลาย / ละทิ้งสิ่งของ ณ ประเทศปลายทาง)</div>
          <p style="margin:4px 0 0 22px;">หากผู้รับปลายทางไม่ชำระค่าภาษีอากรหรือปฏิเสธการรับ ให้ดำเนินการทำลายหรือละทิ้งสิ่งของ ณ ประเทศปลายทาง โดยข้าพเจ้ายินยอมรับผิดชอบค่าทำลาย/ค่าภาษีอากร/ค่าใช้จ่ายที่เกิดขึ้นตามเงื่อนไขที่ผู้ขนส่งเรียกเก็บจริง</p>
        </div>
        <div class="box-choice">
          <div style="font-size:15px; font-weight:700; color:#047857;">☐ ทางเลือกที่ 2: RETURN SHIPMENT TO ORIGIN (ส่งคืนสิ่งของกลับมายังต้นทางประเทศไทย)</div>
          <p style="margin:4px 0 0 22px;">หากผู้รับปลายทางไม่ชำระค่าภาษีอากรหรือปฏิเสธการรับ ให้ดำเนินการส่งคืนสิ่งของกลับมายังต้นทาง โดยข้าพเจ้ายินยอมรับผิดชอบค่าธรรมเนียมการส่งคืนสิ่งของ ค่าภาษีอากร และค่าใช้จ่ายทั้งหมดที่เกิดขึ้นตามเงื่อนไขที่ผู้ขนส่งเรียกเก็บจริง</p>
        </div>
        <div class="sig-row">
          <div class="sig-box">
            <strong>ลงชื่อผู้ฝากส่ง (Sender's Signature)</strong><br><br><br>
            ลงชื่อ: ..........................................................................................<br>
            (..........................................................................................)<br>
            วันที่: ............... / ................................. / 2569
          </div>
          <div class="sig-box">
            <strong>สำหรับเจ้าหน้าที่รับฝาก ปณท</strong><br><br>
            ☐ อธิบายเงื่อนไขภาษี/ค่าใช้จ่ายให้ผู้ฝากส่งทราบแล้ว<br>
            ☐ แนบใส่ซองพลาสติกติดหน้ากล่อง 1 ฉบับ<br>
            ☐ จัดเก็บเป็นหลักฐานที่ ปณ.ต้นทาง 1 ฉบับ<br><br>
            ลงชื่อเจ้าหน้าที่: .......................................... ปณ.: ..............................
          </div>
        </div>
      </body></html>`;
    }

    if (templateType === "PROFORMA_PID_EU") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>New Proforma Invoice (พร้อมช่องรหัส PID สำหรับ EU 27 ประเทศ)</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#EFF6FF; padding:10px; border:1px solid #2563EB; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>แบบฟอร์ม Proforma Invoice รูปแบบใหม่ (มีช่องรหัส PID):</strong> ใช้แนบคู่กับ ป.324 สำหรับบริการ Courier Post ไป EU 27 ประเทศ</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์ Proforma Invoice (PID)</button>
        </div>
        <h1>PROFORMA / COMMERCIAL INVOICE (NEW EU ICS2 / PID FORMAT)</h1>
        <h2>เอกสารสำแดงศุลกากรรูปแบบใหม่ (บังคับระบุรหัส PID สำหรับปลายทางสหภาพยุโรป 27 ประเทศ ตั้งแต่วันที่ 1 พ.ย. 2569)</h2>
        <table>
          <tr>
            <td style="width:50%;">
              <strong>SENDER / EXPORTER (ผู้ฝากส่ง - กรอกภาษาอังกฤษ):</strong><br>
              Name: ..........................................................................................................<br>
              Address: .....................................................................................................<br>
              .....................................................................................................................<br>
              Phone: ........................................... Tax/ID No.: .......................................
            </td>
            <td style="width:50%;">
              <strong>RECIPIENT / CONSIGNEE (ผู้รับปลายทาง EU - กรอกภาษาอังกฤษ):</strong><br>
              Name: ..........................................................................................................<br>
              Address: .....................................................................................................<br>
              City / Postcode / Country: ........................................................................<br>
              <strong>Phone (บังคับ):</strong> ............................. <strong>Email (บังคับ):</strong> .............................
            </td>
          </tr>
          <tr>
            <td><strong>Tracking / Airwaybill No.:</strong> ...................................................................</td>
            <td><strong>Date:</strong> ........../........../2026 &nbsp;|&nbsp; <strong>Currency (สกุลเงิน):</strong> EUR / USD</td>
          </tr>
        </table>
        <table>
          <thead>
            <tr>
              <th style="width:28px;">#</th>
              <th>Full Description of Goods<br>(ระบุชื่อสิ่งของภาษาอังกฤษให้ชัดเจน ห้ามเขียน Gift/Sample)</th>
              <th style="width:85px;">HS Code<br>(6-10 หลัก)</th>
              <th style="width:115px;">M-PID (บังคับ)*<br>(รหัสร้านค้า/ชื่อสินค้า เช่น Lays)</th>
              <th style="width:125px;">NS-PID (บังคับ)*<br>(รหัสผู้ผลิต/บาร์โค้ด 13 หลัก/Lays-Salt)</th>
              <th style="width:90px;">S-PID<br>(ไม่บังคับ EAN/UPC)</th>
              <th style="width:55px;">Origin<br>(เช่น TH)</th>
              <th style="width:45px;">Qty</th>
              <th style="width:65px;">Net Wt (kg)</th>
              <th style="width:75px;">Total Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td style="height:28px;"></td><td></td><td></td><td></td><td></td><td>TH</td><td></td><td></td><td></td></tr>
            <tr><td>2</td><td style="height:28px;"></td><td></td><td></td><td></td><td></td><td>TH</td><td></td><td></td><td></td></tr>
            <tr><td>3</td><td style="height:28px;"></td><td></td><td></td><td></td><td></td><td>TH</td><td></td><td></td><td></td></tr>
            <tr><td>4</td><td style="height:28px;"></td><td></td><td></td><td></td><td></td><td>TH</td><td></td><td></td><td></td></tr>
            <tr><td>5</td><td style="height:28px;"></td><td></td><td></td><td></td><td></td><td>TH</td><td></td><td></td><td></td></tr>
            <tr><td>6</td><td style="height:28px;"></td><td></td><td></td><td></td><td></td><td>TH</td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <p style="font-size:12px;">*คำแนะนำการกรอก PID กรณีส่งให้ญาติ (C2C) หรือไม่มีรหัสบนสินค้า: ช่อง <strong>M-PID</strong> ให้ตั้งด้วยชื่อสินค้าภาษาอังกฤษ (เช่น <code>Lays</code> หรือ <code>MAMA</code>) | ช่อง <strong>NS-PID</strong> ให้ใช้เลขบาร์โค้ด 13 หลักบนซองสินค้า หรือตั้งด้วยชื่อสินค้า+รสชาติ/สี/ตัวเลข (เช่น <code>Lays-Salt</code> หรือ <code>Lays01</code>)</p>
        <p>I/We hereby declare that the information on this invoice is true and correct and that the contents of this shipment are as stated above.<br><br>
        <strong>Signature of Sender (ลายมือชื่อผู้ฝากส่ง):</strong> ....................................................................................... <strong>Date:</strong> ........../........../2026</p>
      </body></html>`;
    }

    if (templateType === "COUNTER_STAMPS_SHEET") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>แผ่นป้ายข้อความติดหน้ากล่อง & โพยป้ายปากถุง</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#ECFDF5; padding:10px; border:1px solid #059669; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>แผ่นป้ายข้อความพร้อมพิมพ์ตัดแปะหน้ากล่อง:</strong> ใช้แปะหน้ากล่องกรณีที่ทำการยังไม่มีตรายาง</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์แผ่นป้ายนี้</button>
        </div>
        <h1>แผ่นป้ายข้อความบังคับติดหน้ากล่อง & โพยเขียนป้ายปากถุงระหว่างประเทศ</h1>
        <h2>1. สำหรับตัดแปะหน้ากล่องบริการ ePacket US (LA/LI) และ ePacket DDP ยุโรป 27 ประเทศ (LE) หลังเปิดตรวจของ 100%</h2>
        <div>
          <span class="stamp-cut">Content Checked</span>
          <span class="stamp-cut">Content Checked</span>
          <span class="stamp-cut">Content Checked</span>
          <span class="stamp-cut">Content Checked</span>
          <span class="stamp-cut">Content Checked</span>
          <span class="stamp-cut">Content Checked</span>
        </div>
        <h2 style="margin-top:14px;">2. สำหรับตัดแปะหน้ากล่องบริการ ePacket DDP ยุโรป 27 ประเทศ (LE) หลังรับชำระภาษีผ่าน Pay@Post (รหัส 84415)</h2>
        <div>
          <span class="stamp-cut" style="border-color:#1D4ED8; color:#1D4ED8;">Duties Paid</span>
          <span class="stamp-cut" style="border-color:#1D4ED8; color:#1D4ED8;">Duties Paid</span>
          <span class="stamp-cut" style="border-color:#1D4ED8; color:#1D4ED8;">Duties Paid</span>
          <span class="stamp-cut" style="border-color:#1D4ED8; color:#1D4ED8;">Duties Paid</span>
          <span class="stamp-cut" style="border-color:#1D4ED8; color:#1D4ED8;">Duties Paid</span>
          <span class="stamp-cut" style="border-color:#1D4ED8; color:#1D4ED8;">Duties Paid</span>
        </div>
        <h2 style="margin-top:14px;">3. สำหรับตัดแปะกล่องที่ 2, 3... ของบริการ Courier Post Plus (Multi-Piece) และบริการเสริม ePacket Plus</h2>
        <div>
          <span class="stamp-cut" style="border-color:#047857; color:#047857;">ชำระค่าบริการแล้ว</span>
          <span class="stamp-cut" style="border-color:#047857; color:#047857;">ชำระค่าบริการแล้ว</span>
          <span class="stamp-cut" style="border-color:#047857; color:#047857;">ชำระค่าบริการแล้ว</span>
          <span class="stamp-cut" style="border-color:#7C3AED; color:#7C3AED;">ePACKET PLUS</span>
          <span class="stamp-cut" style="border-color:#7C3AED; color:#7C3AED;">ePACKET PLUS</span>
          <span class="stamp-cut" style="border-color:#7C3AED; color:#7C3AED;">ePACKET PLUS</span>
        </div>
        <h2 style="margin-top:16px;">4. โพยแยกปิดถุงและเขียนหมายเหตุบนป้ายปากถุง (ติดไว้ที่จุดปิดถุง)</h2>
        <table>
          <thead><tr><th>บริการ / รหัสบาร์โค้ด</th><th>ป้ายปากถุงที่ใช้</th><th>ปิดถุงส่งไปที่ไหน</th><th>ข้อความที่ต้องเขียนบนป้ายปากถุง</th></tr></thead>
          <tbody>
            <tr><td><strong>ePacket DDP ยุโรป 27 ประเทศ (LE...TH)</strong></td><td>ป.322</td><td>ศป.สุวรรณภูมิ (ศป.สภ.)</td><td>เขียนว่า <strong>"ePacket DDP"</strong> หรือ <strong>"ePacket ปลายทาง EU"</strong></td></tr>
            <tr><td><strong>ePacket สหรัฐอเมริกา (LA...TH / LI...TH)</strong></td><td>ป.322</td><td>ศป.สุวรรณภูมิ (ศป.สภ.)</td><td>เขียนว่า <strong>"ePacket ปลายทาง US"</strong></td></tr>
            <tr><td><strong>Courier Post Plus รหัส 【FC...TH】 (UPS)</strong></td><td>ป.94(ก)</td><td><strong>ศป.สุวรรณภูมิ (ศป.สภ.)</strong></td><td>เขียนด้วยมือว่า <strong>"Courier Post Plus"</strong> (สแกนครบทุกชิ้นทั้ง 13 และ 15 หลัก)</td></tr>
            <tr><td><strong>Courier Post Plus รหัส 【FD...TH】 (Karton Express - US 1-20 กก.)</strong></td><td>ป.94</td><td><strong>ศป.EMS</strong></td><td>เขียนด้วยมือว่า <strong>"Courier Post Plus"</strong> (สแกนครบทุกชิ้นทั้ง 13 และ 15 หลัก)</td></tr>
          </tbody>
        </table>
      </body></html>`;
    }

    return "";
  }

  function buildDocCardHtml(doc) {
    const previewHtml = doc.imagePreview
      ? `<img src="${escapeHtml(doc.imagePreview)}" alt="${escapeHtml(doc.title)}" class="doc-preview-img" loading="lazy" />`
      : "";

    const secondaryBtnHtml = doc.secondaryUrl
      ? `<a href="${escapeHtml(doc.secondaryUrl)}" download class="doc-btn download">${escapeHtml(doc.secondaryLabel || "ดาวน์โหลดไฟล์แนบ 2")}</a>`
      : "";

    const printActionAttr = doc.templateType
      ? `data-template="${escapeHtml(doc.templateType)}"`
      : `data-file="${escapeHtml(doc.fileUrl)}"`;

    return `
      <div class="card" id="doc-${escapeHtml(doc.id)}">
        <div class="card-header">
          <div>
            <span class="prefix-tag" style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE;">${escapeHtml(doc.category)}</span>
            <div class="card-title">${escapeHtml(doc.title)}</div>
          </div>
          <span class="badge badge-${escapeHtml(doc.badgeColor || "blue")}">${escapeHtml(doc.badge)}</span>
        </div>

        <div style="font-size:12.5px; font-weight:700; color:var(--thp-red-dark); margin-bottom:6px;">
          📌 ใช้กับบริการ: ${escapeHtml(doc.serviceTag)}
        </div>
        <p style="font-size:13.5px; color:var(--text-main); margin-bottom:8px;">
          ${escapeHtml(doc.description)}
        </p>

        ${previewHtml}

        <div class="doc-actions">
          <button type="button" class="doc-btn print js-print-doc" ${printActionAttr}>
            🖨️ ${doc.templateType ? "เปิดแบบฟอร์มสั่งพิมพ์ A4" : "เปิดดู / สั่งพิมพ์"}
          </button>
          <a href="${escapeHtml(doc.fileUrl)}" download class="doc-btn download">
            ⬇️ ดาวน์โหลดไฟล์ต้นฉบับ
          </a>
          ${secondaryBtnHtml}
          <button type="button" class="doc-btn share js-share-doc" data-title="${escapeHtml(doc.title)}" data-desc="${escapeHtml(doc.description)}" data-url="${escapeHtml(doc.fileUrl)}">
            📤 แชร์ให้ลูกค้า/เพื่อน
          </button>
        </div>
        <div class="ref-foot">📅 อัปเดต: ${escapeHtml(doc.updated)}</div>
      </div>
    `;
  }

  function attachDocActionEvents(rootEl) {
    if (!rootEl) return;

    rootEl.querySelectorAll(".js-print-doc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tpl = btn.getAttribute("data-template");
        const fileUrl = btn.getAttribute("data-file");

        if (tpl) {
          const html = getPrintableTemplateHtml(tpl);
          const win = window.open("", "_blank");
          if (win) {
            win.document.open();
            win.document.write(html);
            win.document.close();
          } else {
            alert("กรุณาอนุญาตให้เบราว์เซอร์เปิดหน้าต่างป๊อปอัป (Pop-up) เพื่อสั่งพิมพ์แบบฟอร์ม");
          }
        } else if (fileUrl) {
          window.open(fileUrl, "_blank");
        }
      });
    });

    rootEl.querySelectorAll(".js-share-doc").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const title = btn.getAttribute("data-title") || "เอกสารบริการระหว่างประเทศ ปณท";
        const desc = btn.getAttribute("data-desc") || "";
        const relUrl = btn.getAttribute("data-url") || "";
        const fullUrl = new URL(relUrl, window.location.href).href;

        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: `${title}\n${desc}`,
              url: fullUrl
            });
            return;
          } catch (err) {
            // ผู้ใช้กดยกเลิกการแชร์ หรือเบราว์เซอร์ไม่รองรับ URL แบบ file://
          }
        }

        try {
          await navigator.clipboard.writeText(`${title}\n${desc}\nลิงก์เอกสาร: ${fullUrl}`);
          const origText = btn.innerHTML;
          btn.innerHTML = "✅ คัดลอกลิงก์/ข้อความแล้ว!";
          setTimeout(() => {
            btn.innerHTML = origText;
          }, 2200);
        } catch (e) {
          window.open(relUrl, "_blank");
        }
      });
    });
  }

  function renderFormsHub() {
    const container = document.getElementById("formsHubContainer");
    if (!container || !DATA.printableDocs) return;

    container.innerHTML = DATA.printableDocs.map((doc) => buildDocCardHtml(doc)).join("");
    attachDocActionEvents(container);
  }

  // 8. ระบบสลับแท็บด้านล่าง (Bottom Tab Navigation)
  function setupTabNavigation() {
    const navBtns = document.querySelectorAll(".bottom-nav .nav-btn");
    const tabSections = document.querySelectorAll(".tab-section");
    const searchSection = document.getElementById("searchResultsSection");
    const searchInput = document.getElementById("globalSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab");

        // ปิดหน้าค้นหาหากเปิดอยู่
        if (searchSection) searchSection.style.display = "none";
        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.style.display = "none";

        navBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        tabSections.forEach((sec) => {
          sec.classList.toggle("active", sec.id === targetId);
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // Initialize เมื่อโหลดหน้าเว็บเสร็จ
  document.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("lastUpdatedBadge");
    if (badge && DATA.lastUpdated) {
      badge.textContent = "อัปเดต " + DATA.lastUpdated;
    }

    setupWizardEvents();
    renderServices();
    renderFormsHub();
    renderDestinations();
    renderProhibited();
    renderPromosAndContacts();
    setupCalculator();
    setupGlobalSearch();
    setupTabNavigation();
  });
})();
