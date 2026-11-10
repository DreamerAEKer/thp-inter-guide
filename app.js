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

  // State สำหรับตัวช่วยตัดสินใจ 3 วินาที (ระหว่างประเทศ)
  let wizardState = {
    dest: "eu",
    item: "general"
  };

  // State โหมดหลักของแอป ("domestic" | "inter") และหมวดเช็คด่วนในประเทศ
  let currentMode = "domestic";
  let domWizSrv = "letter";

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

    const interThemes = [
      "theme-1-blue",
      "theme-5-cyan",
      "theme-2-purple",
      "theme-6-teal",
      "theme-7-crimson",
      "theme-8-orange",
      "theme-3-emerald",
      "theme-4-amber",
      "theme-9-slate"
    ];

    const servicesHtml = DATA.services
      .map((srv, idx) => {
        const themeCls = interThemes[idx % interThemes.length];
        const notesHtml = srv.criticalNotes
          .map((n) => {
            let cls = "";
            if (n.includes("🚨") || n.includes("⚠️") || n.includes("ห้าม")) cls = "critical";
            else if (n.includes("✅")) cls = "good";
            return `<li class="${cls}" style="white-space:pre-line;">${escapeHtml(n)}</li>`;
          })
          .join("");

        const formsHtml = (srv.requiredForms || [])
          .map((f) => `<li class="good" style="background:#EFF6FF; border-left-color:#2563EB; color:#1E3A8A; white-space:pre-line;">${escapeHtml(f)}</li>`)
          .join("");

        const survivalHtml = (srv.survivalGuide || [])
          .map((s) => `<li class="critical" style="white-space:pre-line;">${escapeHtml(s)}</li>`)
          .join("");

        return `
          <div class="card srv-theme-card ${themeCls}" id="service-${escapeHtml(srv.id)}">
            <div class="srv-theme-banner">
              <div>
                <span class="prefix-tag">${escapeHtml(srv.prefix)}</span>
                <div class="card-title">${escapeHtml(srv.name)}</div>
              </div>
              <span class="badge">${escapeHtml(srv.badge)}</span>
            </div>

            <div class="srv-theme-body">
              ${
                srv.dpostInterMode
                  ? `<div style="background:${srv.dpostInterMode.includes("🔴") ? "#FEF2F2" : srv.dpostInterMode.includes("🟡") ? "#FFFBEB" : "#ECFDF5"}; border:1.5px solid ${srv.dpostInterMode.includes("🔴") ? "#EF4444" : srv.dpostInterMode.includes("🟡") ? "#F59E0B" : "#10B981"}; border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:13.5px; font-weight:600; color:${srv.dpostInterMode.includes("🔴") ? "#991B1B" : srv.dpostInterMode.includes("🟡") ? "#92400E" : "#065F46"}; white-space:pre-line;">
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

              <div class="spec-grid" style="background:#FFFFFF; border:1.5px solid #CBD5E1;">
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label">⚖️ พิกัดน้ำหนักสูงสุด</span>
                  <span class="spec-value">${escapeHtml(srv.maxWeight)}</span>
                </div>
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label">📏 ขนาดสูงสุดที่รับฝากได้</span>
                  <span class="spec-value">${escapeHtml(srv.maxSize)}</span>
                </div>
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label">📦 กล่องบรรจุภัณฑ์</span>
                  <span class="spec-value">${escapeHtml(srv.allowedBoxes)}</span>
                </div>
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label">💶 มูลค่าสิ่งของสูงสุด</span>
                  <span class="spec-value">${escapeHtml(srv.maxValue)}</span>
                </div>
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
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
      const rawTab = activeNav ? activeNav.getAttribute("data-tab") : "tab-quick";
      const activeTabId = currentMode === "domestic" ? "dom-" + rawTab : rawTab;
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

      // 00. ค้นหาในบริการในประเทศ (Domestic Services)
      if (DATA.domestic && DATA.domestic.services) {
        const domSearchThemes = [
          { cls: "theme-1-blue", color: "#1D4ED8" },
          { cls: "theme-2-purple", color: "#6D28D9" },
          { cls: "theme-3-emerald", color: "#047857" },
          { cls: "theme-4-amber", color: "#B45309" },
          { cls: "theme-5-cyan", color: "#0369A1" },
          { cls: "theme-6-teal", color: "#0F766E" },
          { cls: "theme-7-crimson", color: "#BE123C" },
          { cls: "theme-8-orange", color: "#C2410C" },
          { cls: "theme-9-slate", color: "#1E293B" }
        ];
        DATA.domestic.services.forEach((srv, idx) => {
          const theme = domSearchThemes[idx % domSearchThemes.length];
          const hay = [
            "ในประเทศ",
            srv.name,
            srv.prefix,
            srv.category,
            srv.posMode || "",
            srv.maxWeight,
            srv.maxSize,
            srv.rateSummary,
            srv.indemnity,
            ...(srv.requiredForms || []),
            ...(srv.survivalGuide || []),
            ...(srv.criticalNotes || [])
          ]
            .join(" ")
            .toLowerCase();

          if (hay.includes(q)) {
            const allNotes = [
              ...(srv.requiredForms || []),
              ...(srv.survivalGuide || []),
              ...(srv.criticalNotes || [])
            ];
            const matchedNotes = allNotes.filter((n) => n.toLowerCase().includes(q));
            const notesToShow = matchedNotes.length > 0 ? matchedNotes : allNotes.slice(0, 5);
            matches.push(`
              <div class="card srv-theme-card ${theme.cls}">
                <div class="srv-theme-banner">
                  <div>
                    <span class="prefix-tag">🇹🇭 ในประเทศ • ${escapeHtml(srv.prefix)}</span>
                    <div class="card-title">${escapeHtml(srv.name)}</div>
                  </div>
                  <span class="badge">${escapeHtml(srv.badge)}</span>
                </div>
                <div class="srv-theme-body">
                  ${
                    srv.posMode
                      ? `<div style="background:#FFFBEB; border:1px solid #F59E0B; border-radius:8px; padding:8px; margin-bottom:8px; font-size:13px; color:#92400E; font-weight:600; white-space:pre-line;">💻 <strong>วิธีทำรายการหน้าเคาน์เตอร์:</strong> ${escapeHtml(srv.posMode)}</div>`
                      : ""
                  }
                  <div class="spec-grid" style="background:#FFFFFF; border:1.5px solid #CBD5E1;">
                    <div class="spec-item"><span class="spec-label">⚖️ น้ำหนักสูงสุด:</span> <span class="spec-value">${escapeHtml(srv.maxWeight)}</span></div>
                    <div class="spec-item"><span class="spec-label">📏 ขนาดสูงสุด:</span> <span class="spec-value">${escapeHtml(srv.maxSize)}</span></div>
                    <div class="spec-item"><span class="spec-label">💰 อัตราค่าบริการ:</span> <div class="spec-value">${formatMultilineToBlocks(srv.rateSummary, theme.color)}</div></div>
                    <div class="spec-item"><span class="spec-label">🛡️ อัตราชดใช้:</span> <span class="spec-value">${escapeHtml(srv.indemnity)}</span></div>
                  </div>
                  <ul class="notes-list">
                    ${notesToShow.map((n) => `<li class="${n.includes("🚨") || n.includes("⚠️") || n.includes("ห้าม") ? "critical" : "good"}" style="white-space:pre-line;">${escapeHtml(n)}</li>`).join("")}
                  </ul>
                </div>
              </div>
            `);
          }
        });
      }

      // 00b. ค้นหาในส่วนลดและอัตราพิเศษในประเทศ (Domestic Promotions)
      if (DATA.domestic && DATA.domestic.promotions) {
        [...(DATA.domestic.promotions.active || []), ...(DATA.domestic.promotions.expired || [])].forEach((p) => {
          const hay = ["ในประเทศ", p.title, p.period, p.target || "", p.posButton || "", p.reason || "", ...(p.services || []), ...(p.conditions || [])].join(" ").toLowerCase();
          if (hay.includes(q)) {
            matches.push(buildPromoCardHtml(p));
          }
        });
      }

      // 00c. ค้นหาในแบบพิมพ์ในประเทศ (Domestic Printable Docs)
      if (DATA.domestic && DATA.domestic.printableDocs) {
        DATA.domestic.printableDocs.forEach((doc) => {
          const hay = ["ในประเทศ", doc.title, doc.category, doc.serviceTag, doc.description, doc.updated].join(" ").toLowerCase();
          if (hay.includes(q)) {
            matches.push(buildDocCardHtml(doc));
          }
        });
      }

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

    if (templateType === "DOM_ADMAIL_FORM") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>ใบนำส่งไปรษณียภัณฑ์ไม่มีจ่าหน้า (Admail) เอกสารหมายเลข 1 และ 2</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#ECFDF5; padding:10px; border:1px solid #059669; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>พร้อมพิมพ์ A4 (2 ฉบับ):</strong> ใบนำส่งไปรษณียภัณฑ์ไม่มีจ่าหน้า (เอกสารหมายเลข 1) และตัวอย่างใบปะหน้าห่อ (เอกสารหมายเลข 2) ตามระเบียบ ปณท ฉบับที่ 215</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์ใบนำส่ง Admail (A4)</button>
        </div>
        <div style="text-align:right; font-weight:700; font-size:13px;">เอกสารหมายเลข 1 (จัดทำ 2 ฉบับ: ปณ.รับฝากเก็บ 1 ฉบับ / คืนผู้ฝากส่ง 1 ฉบับ)</div>
        <h1>บริษัท ไปรษณีย์ไทย จำกัด — ใบนำส่งไปรษณียภัณฑ์ไม่มีจ่าหน้า (Advertising Mail / Admail)</h1>
        <h2>อ้างอิง: ระเบียบ ปณท ว่าด้วยบริการไปรษณียภัณฑ์ไม่มีจ่าหน้า (ฉบับที่ 215) พ.ศ. 2557 และอัตราค่าบริการใหม่ (เริ่ม 1 ม.ค. 2568)</h2>
        <table>
          <tr>
            <td style="width:55%;">
              <strong>ชื่อผู้ฝากส่ง / บริษัท / ผู้สมัครรับเลือกตั้ง:</strong> ........................................................................................<br>
              <strong>ที่อยู่:</strong> ................................................................................................................................................<br>
              <strong>โทรศัพท์:</strong> ........................................................ <strong>วันที่ฝากส่ง:</strong> ............ / ........................ / 2569
            </td>
            <td style="width:45%;">
              <strong>ฝากส่ง ณ ที่ทำการไปรษณีย์:</strong> ....................................................................<br>
              <strong>ประเภทสื่อที่ฝากส่ง:</strong> ☐ แผ่นพับ/ใบปลิวโฆษณา &nbsp; ☐ แค็ตตาล็อก/ตัวอย่างสินค้า<br>
              ☐ <strong>สื่อรณรงค์หาเสียงเลือกตั้ง (≤50 กรัม อัตรา 2.50 บาท/ชิ้น ไม่มีขั้นต่ำ)</strong><br>
              <strong>กำหนดวันที่ต้องการให้นำจ่ายถึงผู้รับ:</strong> ......................................................
            </td>
          </tr>
        </table>
        <table>
          <thead>
            <tr>
              <th style="width:32px;">ลำดับ</th>
              <th>ที่ทำการไปรษณีย์ปลายทาง / รหัสไปรษณีย์</th>
              <th>กลุ่มเป้าหมาย / โซนพื้นที่นำจ่าย<br>(เช่น บ้านพักอาศัย, อาคารชุด, สำนักงาน, หมู่บ้าน/ตำบล)</th>
              <th style="width:85px;">น้ำหนัก/ชิ้น<br>(กรัม)</th>
              <th style="width:95px;">จำนวนชิ้น<br>(ฉบับ)</th>
              <th style="width:95px;">อัตรา/ชิ้น*<br>(บาท)</th>
              <th style="width:110px;">จำนวนเงินรวม<br>(บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td style="height:24px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2</td><td style="height:24px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3</td><td style="height:24px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>4</td><td style="height:24px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>5</td><td style="height:24px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>6</td><td style="height:24px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td colspan="4" style="text-align:right; font-weight:700;">รวมทั้งสิ้น (Total)</td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <p style="font-size:11.5px; margin:4px 0;">
          <strong>*ตารางอัตราค่าบริการเหมาจ่ายตั้งแต่ชิ้นแรก (ตามปริมาณฝากส่งรวมต่อครั้ง):</strong>
          • <strong>≤3,000 ชิ้น:</strong> ≤50ก.=3.50บ. | ≤100ก.=4.50บ. | ≤250ก.=7.50บ. | ≤500ก.=10.50บ.
          • <strong>3,001–10,000 ชิ้น:</strong> 3.40 / 4.40 / 7.40 / 10.40 บ.
          • <strong>10,001–20,000 ชิ้น:</strong> 3.30 / 4.30 / 7.30 / 10.30 บ.
          • <strong>20,001–30,000 ชิ้น:</strong> 3.15 / 4.15 / 7.15 / 10.15 บ.
          • <strong>30,001–50,000 ชิ้น:</strong> 3.00 / 4.00 / 7.00 / 10.00 บ.
          • <strong>50,001–100,000 ชิ้น:</strong> 2.85 / 3.85 / 6.85 / 9.85 บ.
          • <strong>100,001–200,000 ชิ้น:</strong> 2.70 / 3.70 / 6.70 / 9.70 บ.
          • <strong>≥200,001 ชิ้น:</strong> 2.50 / 3.50 / 6.50 / 9.50 บ.
        </p>
        <div class="sig-row" style="margin-top:12px;">
          <div class="sig-box">
            <strong>สำหรับผู้ฝากส่ง</strong><br>
            ข้าพเจ้ารับรองว่าสิ่งของที่ฝากส่งไม่ขัดต่อกฎหมายและระเบียบ ปณท พร้อมได้มอบตัวอย่างจริงให้ ปณ.รับฝากแล้ว<br><br>
            ลงชื่อผู้ฝากส่ง: ........................................................................
          </div>
          <div class="sig-box">
            <strong>สำหรับเจ้าหน้าที่รับฝาก ปณท</strong><br>
            ☐ ตรวจสอบตัวอย่างจริงและจำนวนมัดครบถ้วนแล้ว<br>
            ☐ รับชำระเงินตามใบเสร็จรับเงินเลขที่: ..........................................<br><br>
            ลงชื่อเจ้าหน้าที่รับฝาก: ............................................................
          </div>
        </div>
        <hr style="border:1px dashed #64748B; margin:16px 0;" />
        <div style="font-weight:700; font-size:13.5px; color:#B91C1C; margin-bottom:6px;">✂️ ส่วนสำหรับตัดแปะหน้ามัด/ห่อ (เอกสารหมายเลข 2: มัดละ 50 หรือ 100 ชิ้น แยกตามรหัสไปรษณีย์ปลายทาง)</div>
        <table>
          <tr>
            <td style="width:50%; padding:10px;">
              <div style="font-size:15px; font-weight:700; color:#B91C1C;">ไปรษณียภัณฑ์ไม่มีจ่าหน้า (Admail)</div>
              <strong>ส่งถึง ปณ.ปลายทาง:</strong> ..................................................... <strong>รหัสไปรษณีย์:</strong> .........................<br>
              <strong>กลุ่มเป้าหมาย/พื้นที่นำจ่าย:</strong> ...........................................................................................<br>
              <strong>จำนวนในมัดนี้:</strong> ........................ ชิ้น (มัดที่ ........ / ........) | <strong>วันที่ต้องการให้นำจ่าย:</strong> .........................<br>
              <strong>ชื่อผู้ฝากส่ง:</strong> ............................................................. <strong>ปณ.ต้นทาง:</strong> ....................................
            </td>
            <td style="width:50%; padding:10px;">
              <div style="font-size:15px; font-weight:700; color:#B91C1C;">ไปรษณียภัณฑ์ไม่มีจ่าหน้า (Admail)</div>
              <strong>ส่งถึง ปณ.ปลายทาง:</strong> ..................................................... <strong>รหัสไปรษณีย์:</strong> .........................<br>
              <strong>กลุ่มเป้าหมาย/พื้นที่นำจ่าย:</strong> ...........................................................................................<br>
              <strong>จำนวนในมัดนี้:</strong> ........................ ชิ้น (มัดที่ ........ / ........) | <strong>วันที่ต้องการให้นำจ่าย:</strong> .........................<br>
              <strong>ชื่อผู้ฝากส่ง:</strong> ............................................................. <strong>ปณ.ต้นทาง:</strong> ....................................
            </td>
          </tr>
        </table>
      </body></html>`;
    }

    if (templateType === "DOM_TRASIN_FORM") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>แบบคำขอฝากส่งหนังสือพิมพ์ตราสิน (ป.244) และตัวอย่างกรอบตรา 2x4 ซม.</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#EFF6FF; padding:10px; border:1px solid #2563EB; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>พร้อมพิมพ์ A4:</strong> แบบจำลองใบนำส่งหนังสือพิมพ์ตราสิน (ป.244 ตอนที่ 1–4) + ตัวอย่างกรอบตรา "หนังสือพิมพ์ตราสิน" ขนาด 2×4 ซม.</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์แบบ ป.244 & ตัวอย่างกรอบตรา</button>
        </div>
        <h1>แบบคำขอฝากส่งหนังสือพิมพ์ตราสิน (แบบ ป.244) & คู่มือตรวจสอบหน้าเคาน์เตอร์</h1>
        <h2>อ้างอิง: ระเบียบ ปณท ว่าด้วยบริการหนังสือพิมพ์ตราสิน (ฉบับที่ 234) พ.ศ. 2558</h2>
        <table>
          <tr>
            <td style="width:62%;">
              <strong>ชื่อหนังสือพิมพ์/สิ่งพิมพ์ตราสิน:</strong> ........................................................................................................<br>
              <strong>ใบอนุญาตเลขที่:</strong> ............................................... <strong>ออกให้ ณ วันที่:</strong> .....................................................<br>
              <strong>วันหมดอายุใบอนุญาต:</strong> ....................................... <em>(ต้องต่ออายุล่วงหน้าอย่างน้อย 15 วัน ค่าธรรมเนียม 100 บ./ปี)</em><br>
              <strong>ฝากส่ง ณ ที่ทำการไปรษณีย์ (ต้องตรงกับที่ระบุในใบอนุญาตเท่านั้น):</strong> ....................................................<br>
              <strong>ประจำฉบับที่ / วัน-เดือน-ปีที่ออก:</strong> .....................................................................................................
            </td>
            <td style="width:38%; text-align:center; vertical-align:middle;">
              <div style="font-size:12px; font-weight:700; margin-bottom:4px;">ตัวอย่างกรอบข้อความที่ต้องพิมพ์มุมขวาบนของซอง/ปก<br>(ขนาดไม่น้อยกว่า 2 × 4 ซม.)</div>
              <div style="border:2.5px solid #0F172A; width:160px; height:76px; margin:0 auto; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:700; font-size:13.5px; line-height:1.35;">
                <span>หนังสือพิมพ์ตราสิน</span>
                <span>ชำระค่าฝากส่งเป็นรายเดือน</span>
                <span style="font-size:12px;">ใบอนุญาตที่ ........../..........</span>
              </div>
              <div style="font-size:11px; color:#B91C1C; margin-top:4px;">*แม้พิมพ์ว่า "ชำระค่าฝากส่งเป็นรายเดือน" แต่ต้องชำระเงินสดทุกครั้งที่ฝากส่ง!</div>
            </td>
          </tr>
        </table>
        <table>
          <thead>
            <tr>
              <th>รายละเอียดการฝากส่งในครั้งนี้ (ต้องฝากส่งไม่ต่ำกว่า 100 ฉบับ/ครั้ง และขนาด/น้ำหนักเท่ากันทุกฉบับ)</th>
              <th style="width:110px;">น้ำหนักต่อฉบับ (กรัม)</th>
              <th style="width:110px;">จำนวนฉบับที่ส่ง</th>
              <th style="width:130px;">อัตราค่าบริการ/ฉบับ (บาท)</th>
              <th style="width:130px;">รวมเป็นเงินทั้งสิ้น (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="height:36px;">หนังสือพิมพ์ตราสิน (ลดสูงสุด 50% จากอัตราของตีพิมพ์ปกติ)</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4" style="text-align:right; font-weight:700;">รวมเงินที่ต้องชำระ (ปัดเศษสตางค์ขึ้นเป็น .25 / .50 / .75 / 1.00 บาท)</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="box-choice" style="background:#FFFBEB; border-color:#D97706; font-size:12.5px;">
          <strong>🛡️ เช็คลิสต์บังคับสำหรับเจ้าหน้าที่รับฝาก (ตามระเบียบฉบับที่ 234):</strong><br>
          ☐ 1. ตรวจสอบว่าเป็น ปณ.เดียวกับที่ระบุในใบอนุญาต (ห้ามรับฝากข้าม ปณ. เด็ดขาด) และใบอนุญาตยังไม่หมดอายุ<br>
          ☐ 2. ผู้ฝากส่งส่งมอบ <strong>ตัวอย่างหนังสือพิมพ์ฉบับที่ฝากส่งจริง จำนวน 2 ฉบับ</strong> (เก็บไว้ที่ ปณ.รับฝาก 1 ฉบับ + ส่งไปส่วนบริการสื่อสารบริการธุรกิจ 1 ฉบับ)<br>
          ☐ 3. จำนวนฝากส่งครบ <strong>100 ฉบับขึ้นไป</strong> และมัดแยกตามรหัสไปรษณีย์/จังหวัดปลายทางเรียบร้อยแล้ว<br>
          ☐ 4. การแยกแบบ <strong>ป.244 ทั้ง 4 ตอน</strong> หลังรับชำระเงินสดและประทับตราประจำวันแล้ว:
          <strong>ตอนที่ 1</strong> ส่งฝ่ายการเงินฯ | <strong>ตอนที่ 2</strong> แนบส่งไปกับถุงหนังสือพิมพ์ | <strong>ตอนที่ 3</strong> มอบให้ผู้ฝากส่งเป็นใบเสร็จรับเงิน | <strong>ตอนที่ 4</strong> เก็บไว้เป็นหลักฐานที่ ปณ.รับฝาก
        </div>
        <div class="sig-row">
          <div class="sig-box">
            <strong>ลงชื่อผู้ฝากส่ง / ผู้รับมอบอำนาจ</strong><br><br><br>
            ลงชื่อ: .....................................................................................<br>
            วันที่: ............ / ........................ / 2569
          </div>
          <div class="sig-box">
            <strong>ลงชื่อเจ้าหน้าที่รับฝาก ปณท</strong><br><br>
            ☐ ได้รับตัวอย่างหนังสือพิมพ์จริง 2 ฉบับ และรับชำระเงินสดครบถ้วนแล้ว<br><br>
            ลงชื่อ: ......................................................... ปณ.: .................................
          </div>
        </div>
      </body></html>`;
    }

    if (templateType === "DOM_BULK_DEPOSIT_FORM") {
      let rows = "";
      for (let i = 1; i <= 20; i++) {
        rows += `<tr><td style="text-align:center;">${i}</td><td style="height:21px;"></td><td></td><td></td><td></td><td></td><td></td></tr>`;
      }
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>ใบนำส่งสิ่งของฝากส่งทางไปรษณีย์เป็นจำนวนมาก (ในประเทศ 20 รายการ)</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#EFF6FF; padding:10px; border:1px solid #2563EB; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>พร้อมพิมพ์ A4:</strong> ใบนำส่งรับฝากรวมในประเทศ 20 รายการ (ใช้ได้ทั้ง ลงทะเบียน R, EMS ในประเทศ, eCo-Post และ พัสดุไปรษณีย์ P)</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์ใบนำส่ง 20 รายการ</button>
        </div>
        <h1>บริษัท ไปรษณีย์ไทย จำกัด — ใบนำส่งสิ่งของฝากส่งทางไปรษณีย์ในประเทศ</h1>
        <h2>สำหรับ: ☐ ลงทะเบียนในประเทศ (R) &nbsp;&nbsp; ☐ EMS ในประเทศ (E) &nbsp;&nbsp; ☐ eCo-Post (O) &nbsp;&nbsp; ☐ พัสดุไปรษณีย์ (P) &nbsp;&nbsp; ☐ บริการรับประกัน</h2>
        <p style="margin:4px 0;">
          <strong>ชื่อผู้ฝากส่ง / หน่วยงาน:</strong> ................................................................................................. <strong>โทรศัพท์:</strong> .................................................<br>
          <strong>ฝากส่ง ณ ปณ.:</strong> ......................................................................................... <strong>ประจำวันที่:</strong> ............ / ........................ / 2569 (แผ่นที่ ........ / ........)
        </p>
        <table>
          <thead>
            <tr>
              <th style="width:34px; text-align:center;">ลำดับ</th>
              <th>ชื่อผู้รับปลายทาง</th>
              <th style="width:95px;">รหัสไปรษณีย์<br>/ ปลายทาง</th>
              <th style="width:155px;">เลขที่บาร์โค้ด 13 หลัก<br>(R / E / O / P ... TH)</th>
              <th style="width:70px;">น้ำหนัก<br>(กรัม)</th>
              <th style="width:75px;">ค่าฝากส่ง<br>(บาท)</th>
              <th style="width:95px;">บริการเสริม<br>(AR / รับประกัน)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td colspan="4" style="text-align:right; font-weight:700;">รวมทั้งสิ้น (Total)</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="sig-row" style="margin-top:12px;">
          <div class="sig-box">
            <strong>ลงชื่อผู้ฝากส่ง:</strong> ..............................................................................<br>
            จำนวนรวมทั้งสิ้น ......................... ชิ้น
          </div>
          <div class="sig-box">
            <strong>ลงชื่อเจ้าหน้าที่รับฝาก:</strong> .....................................................................<br>
            (ประทับตราประจำวัน ปณ.รับฝาก)
          </div>
        </div>
      </body></html>`;
    }

    if (templateType === "DOM_MOTORCYCLE_CHECKLIST") {
      return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>แบบตรวจสภาพรถจักรยานยนต์ EMS Jumbo (จัดทำ 3 ฉบับ) & ป้าย ป.309</title>${baseStyle}</head><body>
        <div class="no-print" style="background:#FEF2F2; padding:10px; border:1px solid #DC2626; margin-bottom:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>พร้อมพิมพ์ A4 (จัดทำ 3 ฉบับ):</strong> (1) แนบตัวรถในซองพลาสติกใส (2) มอบให้ผู้ฝากคู่ใบเสร็จ (3) เก็บที่ ปณ.ต้นทาง</span>
          <button onclick="window.print()" style="background:#D91920; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">🖨️ สั่งพิมพ์แบบตรวจสภาพรถ (A4)</button>
        </div>
        <h1>บริษัท ไปรษณีย์ไทย จำกัด — แบบบันทึกตรวจสอบสภาพรถจักรยานยนต์ (บริการ EMS Jumbo)</h1>
        <h2>อ้างอิงบันทึก ปณท รป.(รฝ.2)/363 และ รป.(รฝ.2)/718 (จัดทำ 3 ฉบับ: แนบรถ 1 / ให้ผู้ฝากส่ง 1 / เก็บที่ ปณ.ต้นทาง 1)</h2>
        <div class="box">
          <strong>ปณ.รับฝากต้นทาง:</strong> ........................................................ <strong>วันที่รับฝาก:</strong> ......../................/2569 <strong>เลขที่บาร์โค้ด EMS Jumbo:</strong> <code>E_______________________TH</code><br>
          <strong>ชื่อผู้ฝากส่ง:</strong> ............................................................................... <strong>เบอร์โทรผู้ฝาก:</strong> ............................................... <strong>เลขบัตร ปชช.:</strong> .....................................................<br>
          <strong>ชื่อผู้รับปลายทาง:</strong> ........................................................................ <strong>เบอร์โทรผู้รับ:</strong> ................................................ <strong>ปณ.ปลายทาง:</strong> .....................................................<br>
          <strong>ที่อยู่ผู้รับโดยละเอียด (บังคับคีย์ลง CA POS):</strong> บ้านเลขที่ ................. หมู่ ........ ซอย/ถนน ....................................... ตำบล/แขวง ....................................... อำเภอ/เขต ....................................... จังหวัด ....................................... รหัสไปรษณีย์ .......................
        </div>
        <div class="box">
          <strong>1. ข้อมูลรถจักรยานยนต์ & เอกสารประกอบการรับฝาก:</strong><br>
          • ยี่ห้อ/รุ่น: ................................................................. สี: ................................. ป้ายทะเบียน: ......................................... ขนาดเครื่องยนต์: .............. CC (เรทโซน ........)<br>
          • เลขตัวถัง/เลขเครื่อง: .................................................................................... เลขไมล์ขณะรับฝาก: ...................................... กม.<br>
          • <strong>เอกสารที่ตรวจสอบแล้ว:</strong> ☐ สำเนาเล่มทะเบียนรถ (หรือใบซื้อขาย) &nbsp;&nbsp; ☐ สำเนาบัตรประชาชนผู้ฝากส่ง &nbsp;&nbsp; ☐ กุญแจรถจำนวน ........ ดอก (มัดติดตัวรถในซองกันกระแทก)<br>
          • <strong>การเตรียมรถก่อนหุ้มห่อ (บังคับ):</strong> ☐ ถ่ายน้ำมันเชื้อเพลิงออกเหลือไม่เกิน 1/4 ถัง &nbsp;&nbsp; ☐ ถอดกระจกมองข้างทั้ง 2 ข้างออกแพ็คแยก &nbsp;&nbsp; ☐ ถอดขั้วแบตเตอรี่ (กรณีรถไฟฟ้า/Big Bike)<br>
          • <strong>การหุ้มห่อตามมาตรฐาน ปณท:</strong> ☐ หุ้มด้วย <strong>โฟม EPE (EPE Foam)</strong> รอบคัน (หรือ Air Bubble หนา + กระดาษลูกฟูกทับ <em>*ห้ามนำกระดาษลูกฟูกสัมผัสสีรถโดยตรงเด็ดขาด!*</em>)
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:32%;">ตำแหน่งชิ้นส่วนรถจักรยานยนต์</th>
              <th style="width:22%; text-align:center;">สภาพปกติ</th>
              <th style="width:46%;">พบร่องรอยขีดข่วน / แตกหัก / ตำหนิเดิมก่อนฝากส่ง (ระบุละเอียด)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1. ชุดไฟหน้า / หน้ากาก / บังลมหน้า</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>2. บังโคลนหน้า / โช้คอัพหน้า / ล้อแม็ก-ซี่ลวดหน้า</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>3. แฮนด์ซ้าย-ขวา / มือเบรก-คลัตช์ / เรือนไมล์</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>4. ถังน้ำมัน / ชุดสีแฟริ่งข้างซ้าย (Left Side)</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>5. ชุดสีแฟริ่งข้างขวา (Right Side) / ท่อไอเสีย</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>6. เบาะนั่ง / กล่องเก็บของใต้เบาะ / กันตกท้าย</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>7. ชุดไฟท้าย / ไฟเลี้ยวหน้า-หลัง / บังโคลนหลัง</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
            <tr><td>8. ขาตั้งเดี่ยว / ขาตั้งคู่ / พักเท้าหน้า-หลัง / เครื่องยนต์</td><td style="text-align:center;">☐ ปกติ</td><td>☐ มีรอย: ................................................................................................</td></tr>
          </tbody>
        </table>
        <div class="box" style="background:#FFFBEB; font-size:12px;">
          <strong>ข้อตกลงรับทราบเงื่อนไข:</strong> ผู้ฝากส่งและเจ้าหน้าที่รับฝากได้ร่วมกันตรวจสอบสภาพรถจักรยานยนต์และถ่ายภาพมุมรอบคันไว้เป็นหลักฐานถูกต้องตรงกันแล้ว ทั้งนี้ ไปรษณีย์ไทยรับผิดชอบชดใช้ค่าเสียหายตามจริงไม่เกิน 3,000 บาท (หรือตามวงเงินรับประกันภัยที่ซื้อเพิ่มสูงสุดไม่เกิน 200,000 บาท) และหากสิ่งของถึง ปณ.ปลายทางแล้วผู้รับไม่มารับภายใน 7 วัน จะมีค่าเก็บรักษาวันละ 25 บาท/ชิ้น
        </div>
        <div class="sig-row">
          <div class="sig-box">
            <strong>ลงชื่อผู้ฝากส่ง (ยืนยันสภาพรถก่อนส่ง):</strong><br><br>
            ลงชื่อ .................................................................................<br>
            (.........................................................................................)
          </div>
          <div class="sig-box">
            <strong>ลงชื่อเจ้าหน้าที่ ปณ.ต้นทาง (ผู้ตรวจสภาพ/รับฝาก):</strong><br><br>
            ลงชื่อ .................................................................................<br>
            ตำแหน่ง ................................................ ปณ. .......................
          </div>
        </div>
        <div class="sig-row" style="margin-top:8px;">
          <div class="sig-box" style="grid-column: 1 / -1; background:#F8FAFC;">
            <strong>ส่วนสำหรับผู้รับปลายทาง (เมื่อรับมอบรถ ณ ปณ.ปลายทาง หรือนำส่งถึงบ้าน):</strong> ข้าพเจ้าได้รับมอบรถจักรยานยนต์หมายเลขบาร์โค้ดข้างต้นในสภาพเรียบร้อยถูกต้องแล้ว<br>
            ลงชื่อผู้รับ: ........................................................................... วันที่รับ: ......../............/2569 เวลา .............. น. | เจ้าหน้าที่นำจ่าย: .........................................................
          </div>
        </div>
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

  // =========================================================================
  // 🇹🇭 ส่วนฟังก์ชันสำหรับบริการในประเทศครบ 9 หมวด (DOMESTIC SERVICES MODULE)
  // =========================================================================
  function renderDomWizardOutput() {
    const out = document.getElementById("domWizardOutput");
    if (!out) return;

    let html = "";
    if (domWizSrv === "letter") {
      html = `
        <div style="color:#1E40AF; font-weight:700; font-size:15px; margin-bottom:8px;">
          ✉️ 1. จดหมาย (ซอง / หีบห่อ), ไปรษณียบัตร และของตีพิมพ์ (สูงสุด 5 กก.)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="critical"><strong>🚨 กฎเหล็กแยก "จดหมายซอง" กับ "จดหมายหีบห่อ" (ห้ามคิดเรทผิดเด็ดขาด!):</strong>
            <br>• <strong>ซองพลาสติกทุกกรณี</strong>, <strong>ซองกระดาษที่โป่งนูน</strong>, หรือ <strong>ซองขยายข้างที่ ก+ย+ส เกิน 60 ซม.</strong> ➔ <strong>ต้องคิดเรท "จดหมายหีบห่อ" เสมอ!</strong>
            <br>• เรทจดหมายหีบห่อ: <strong>≤500ก. = 34 บ. (ลงทะเบียน R = 49 บ.)</strong> | <strong>≤1กก. = 45 บ. (R = 60 บ.)</strong> | <strong>≤2กก. = 62 บ. (R = 77 บ.)</strong>
          </li>
          <li class="good"><strong>✅ เรทจดหมายซองกระดาษปกติ (ก+ย+ส ≤ 60 ซม., บางเรียบ):</strong>
            <br>• <strong>≤10ก. = 5 บ. (R 18 บ.)</strong> | <strong>≤20ก. = 6 บ. (R 19 บ.)</strong> | <strong>≤100ก. = 11 บ. (R 24 บ.)</strong> | <strong>≤250ก. = 17 บ. (R 30 บ.)</strong> | <strong>≤500ก. = 23 บ. (R 36 บ.)</strong> | <strong>≤1กก. = 40 บ. (R 53 บ.)</strong> | <strong>≤2กก. = 62 บ. (R 75 บ.)</strong>
          </li>
          <li class="good"><strong>📚 เรทของตีพิมพ์ / สิ่งพิมพ์ (หนังสือส่งได้สูงสุดถึง 5 กก.!):</strong>
            <br>• ≤50ก.=<strong>4 บ.</strong> | ≤100ก.=<strong>5 บ.</strong> | ≤250ก.=<strong>8 บ.</strong> | ≤500ก.=<strong>11 บ.</strong> | ≤1กก.=<strong>17 บ.</strong> | ≤2กก.=<strong>33 บ.</strong> | เกิน 2 กก. บวกเพิ่ม กก.ละ <strong>16 บ.</strong> (≤3กก.=<strong>49 บ.</strong>, ≤4กก.=<strong>65 บ.</strong>, ≤5กก.=<strong>81 บ.</strong>)
            <br>• ต้องหุ้มห่อแบบเปิดตรวจได้ และระบุคำว่า <strong>"ของตีพิมพ์" / "สิ่งพิมพ์"</strong> มุมซอง (ลงทะเบียนสิ่งพิมพ์ บวก +13 บ.)
          </li>
        </ul>
      `;
    } else if (domWizSrv === "trasin") {
      html = `
        <div style="color:#4338CA; font-weight:700; font-size:15px; margin-bottom:8px;">
          📰 2. บริการหนังสือพิมพ์ตราสิน (ระเบียบ ปณท ฉบับที่ 234 พ.ศ. 2558 — แบบ ป.244)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>🎁 ส่วนลดตามกำหนดออก (ลดจากเรทของตีพิมพ์ปกติ):</strong>
            <br>• <strong>รายวัน: ลด 50%</strong> | <strong>ราย 2–15 วัน (รายสัปดาห์/รายปักษ์): ลด 35%</strong> | <strong>รายเดือน / ราย 2–3 เดือน: ลด 25%</strong>
            <br>• คำนวณยอดรวมต่อครั้ง หากมีเศษสตางค์ให้ปัดขึ้นเป็น <strong>.25 / .50 / .75 / 1.00 บาท</strong>
          </li>
          <li class="critical"><strong>🚨 กฎเหล็กหน้าเคาน์เตอร์ (5 ข้อต้องเช็คก่อนรับฝาก!):</strong>
            <br>1. <strong>ต้องฝากส่ง ณ ปณ. แห่งเดียวที่ระบุไว้ในใบอนุญาตเท่านั้น!</strong> (ห้ามรับฝากข้าม ปณ.)
            <br>2. ต้องฝากส่งครั้งละ <strong>ไม่ต่ำกว่า 100 ฉบับ</strong> โดยทุกฉบับต้องมีขนาด/น้ำหนักเท่ากัน และมัดแยกตามรหัสไปรษณีย์
            <br>3. มุมขวาบนของซอง/ปกต้องมีกรอบสี่เหลี่ยมขนาดไม่น้อยกว่า <strong>2 × 4 ซม.</strong> พิมพ์คำว่า <code>หนังสือพิมพ์ตราสิน / ชำระค่าบริการเป็นเงินสด / ใบอนุญาตที่ .../...</code>
            <br>4. <strong>ชำระค่าฝากส่งเป็นเงินสดทุกครั้ง!</strong> พร้อมยื่น <strong>แบบ ป.244 (ครบ 4 ตอน)</strong> และมอบ <strong>ตัวอย่างหนังสือพิมพ์ฉบับจริง 2 ฉบับ</strong> ทุกครั้ง
            <br>5. ค่าธรรมเนียมออกใบอนุญาต/ต่ออายุรายปี <strong>100 บาท/ปี</strong> (ต้องยื่นต่ออายุล่วงหน้าอย่างน้อย <strong>15 วัน</strong> ก่อนสิ้นปีปฏิทิน)
          </li>
        </ul>
      `;
    } else if (domWizSrv === "admail") {
      html = `
        <div style="color:#047857; font-weight:700; font-size:15px; margin-bottom:8px;">
          📢 3. ไปรษณียภัณฑ์ไม่มีจ่าหน้า (Advertising Mail / Admail — ระเบียบฉบับที่ 215)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>💰 ตารางอัตราเหมาจ่ายตั้งแต่ชิ้นแรก (ลดตามปริมาณรวมต่อครั้ง):</strong>
            <br>• <strong>ไม่เกิน 5,000 ชิ้น:</strong> ≤50ก. = <strong>3.50 บ.</strong> | 51–100ก. = <strong>4.50 บ.</strong> | 101–250ก. = <strong>6.50 บ.</strong> | 251–500ก. = <strong>9.50 บ.</strong>
            <br>• <strong>5,001 – 20,000 ชิ้น:</strong> ≤50ก. = <strong>3.00 บ.</strong> | 51–100ก. = <strong>4.00 บ.</strong> | 101–250ก. = <strong>6.00 บ.</strong> | 251–500ก. = <strong>9.00 บ.</strong>
            <br>• <strong>20,001 – 50,000 ชิ้น:</strong> ≤50ก. = <strong>2.75 บ.</strong> | 51–100ก. = <strong>3.75 บ.</strong> | 101–250ก. = <strong>5.75 บ.</strong> | 251–500ก. = <strong>8.75 บ.</strong>
            <br>• <strong>ตั้งแต่ 50,001 ชิ้นขึ้นไป:</strong> ≤50ก. = <strong>2.50 บ.</strong> | 51–100ก. = <strong>3.50 บ.</strong> | 101–250ก. = <strong>5.50 บ.</strong> | 251–500ก. = <strong>8.50 บ.</strong>
          </li>
          <li class="good" style="background:#ECFDF5; border-left-color:#059669;"><strong>🗳️ สิทธิพิเศษ "สื่อรณรงค์หาเสียงเลือกตั้งทุกประเภท" (อบต. / อบจ. / เทศบาล / สส. / สว.):</strong>
            <br>พิกัดน้ำหนักไม่เกิน 50 กรัม คิดอัตราพิเศษ <strong>2.50 บาท/ชิ้น ตั้งแต่ชิ้นแรก โดยไม่กำหนดจำนวนขั้นต่ำ!</strong>
          </li>
          <li class="critical"><strong>📋 แบบพิมพ์ & การเตรียมงานรับฝาก:</strong>
            <br>• ยื่น <strong>ใบนำส่งไปรษณียภัณฑ์ไม่มีจ่าหน้า (เอกสารหมายเลข 1)</strong> 2 ฉบับ + แนบตัวอย่างสื่อจริง
            <br>• ลูกค้าต้องมัดเป็นห่อ <strong>ห่อละ 50 หรือ 100 ชิ้น</strong> แยกตาม ปณ.ปลายทาง พร้อมแปะ <strong>ใบปะหน้าห่อถึงหัวหน้า ปณ.ปลายทาง (เอกสารหมายเลข 2)</strong>
          </li>
        </ul>
      `;
    } else if (domWizSrv === "parcel") {
      html = `
        <div style="color:#1D4ED8; font-weight:700; font-size:15px; margin-bottom:8px;">
          📦 4. บริการพัสดุไปรษณีย์ในประเทศ (บาร์โค้ด P...TH — สูงสุด 20 กก.)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>💰 สูตรคำนวณอัตราค่าบริการ (จำง่ายที่สุด!):</strong>
            <br>• <strong>กิโลกรัมแรก 25 บาท + กิโลกรัมต่อไป กก.ละ 20 บาท</strong> (เศษของ กก. ปัดเป็น 1 กก.)
            <br>• ตัวอย่าง: ≤1กก.=<strong>25 บ.</strong> | ≤2กก.=<strong>45 บ.</strong> | ≤3กก.=<strong>65 บ.</strong> | ≤5กก.=<strong>105 บ.</strong> | ≤10กก.=<strong>205 บ.</strong> | ≤15กก.=<strong>305 บ.</strong> | ≤20กก.=<strong>405 บ.</strong>
            <br>• <strong>ข้อดี:</strong> <strong>ไม่เสียค่าธรรมเนียมน้ำมัน (Fuel Surcharge +3 บ.)</strong> และ <strong>ไม่เสียค่าพื้นที่ห่างไกล/เกาะ (+20 บ.)!</strong>
          </li>
          <li class="critical"><strong>🚨 คำเตือนสำคัญที่ต้องแจ้งลูกค้าหน้าเคาน์เตอร์ทุกครั้ง:</strong>
            <br>• บาร์โค้ด <code>P...TH</code> <strong>ไม่สามารถเช็คสถานะออนไลน์ระหว่างทางในเว็บ Track & Trace ได้!</strong> (ตรวจสอบได้เฉพาะที่ ปณ. เท่านั้น)
            <br>• หากลูกค้าต้องการเช็คเลขในมือถือ แนะนำให้ขยับไปใช้ <strong>eCo-Post (O)</strong> หรือ <strong>EMS (E)</strong> แทน
            <br>• ขนาดสูงสุด: ด้านยาวสุดไม่เกิน <strong>150 ซม.</strong> และผลรวม <code>ยาว + 2(กว้าง + สูง)</code> ไม่เกิน <strong>300 ซม.</strong> | ชดใช้ค่าเสียหายตามจริงสูงสุด <strong>1,000 บาท/ชิ้น</strong>
          </li>
        </ul>
      `;
    } else if (domWizSrv === "registered") {
      html = `
        <div style="color:#B45309; font-weight:700; font-size:15px; margin-bottom:8px;">
          🔖 5. บริการไปรษณีย์ลงทะเบียนในประเทศ (R...TH) & บริการตอบรับอิเล็กทรอนิกส์ (e-AR)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>💰 ค่าธรรมเนียมลงทะเบียน (บวกเพิ่มจากค่าไปรษณียากรปกติ):</strong>
            <br>• <strong>ลงทะเบียนซองกระดาษปกติ / ของตีพิมพ์:</strong> บวกเพิ่ม <strong>+13 บาท/ชิ้น</strong> (เช่น จดหมายซอง ≤10ก. 5+13 = <strong>18 บ.</strong>)
            <br>• <strong>ลงทะเบียนหีบห่อ (ซองพลาสติก / ซองป่อง / ซองขยายข้าง ก+ย+ส &gt; 60 ซม. / กล่องเล็ก):</strong> บวกเพิ่ม <strong>+15 บาท/ชิ้น</strong> (เช่น หีบห่อ ≤500ก. 34+15 = <strong>49 บ.</strong>)
          </li>
          <li class="good" style="background:#EFF6FF; border-left-color:#2563EB; color:#1E3A8A;"><strong>📲 บริการตอบรับในประเทศ (AR กระดาษ ป.133ก vs e-AR อิเล็กทรอนิกส์):</strong>
            <br>• <strong>ใบตอบรับกระดาษ ป.133(ก) (AR):</strong> ใช้คู่กับลงทะเบียน (R) <strong>+3 บ.</strong> | ใช้คู่กับพัสดุ (P) <strong>+6 บ.</strong> | ใช้คู่กับ EMS (E) <strong>+10 บ.</strong>
            <br>• <strong>ตอบรับอิเล็กทรอนิกส์ (e-AR — แนะนำ!):</strong> ค่าบริการเพียง <strong>+5 บาท/ชิ้น</strong> (ใช้ได้กับ R, P และ EMS) <strong>ต้องคีย์เบอร์มือถือ 10 หลักของผู้ฝากส่งใน CA POS</strong> ระบบจะส่ง SMS แจ้ง 2 ครั้ง (เมื่อรับฝากเสร็จ และเมื่อนำจ่ายสำเร็จพร้อมชื่อผู้รับ) ลดปัญหาใบเหลือง ป.133(ก) หาย!
          </li>
          <li class="critical"><strong>🛡️ อัตราชดใช้ & ข้อห้ามเด็ดขาด:</strong>
            <br>• ชดใช้ตามจริงสูงสุด <strong>300 บาท (ลงทะเบียนซอง/สิ่งพิมพ์)</strong> และ <strong>500 บาท (ลงทะเบียนหีบห่อ)</strong> | <strong>น้ำหนักสูงสุดไม่เกิน 2 กก.</strong>
            <br>• <strong>ห้ามบรรจุเงินสด ทองคำ พระเครื่องมูลค่าสูง หรือของมีค่าในบริการลงทะเบียนเด็ดขาด!</strong> (หากสูญหายจะไม่ได้รับการชดใช้ตามระเบียบ ข้อ 186)
          </li>
        </ul>
      `;
    } else if (domWizSrv === "ecopost") {
      html = `
        <div style="color:#047857; font-weight:700; font-size:15px; margin-bottom:8px;">
          🌱 6. บริการ eCo-Post (บาร์โค้ด O...TH — ประหยัด เช็คสถานะต้นทาง-ปลายทางได้!)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>💰 ตารางอัตราค่าบริการ eCo-Post (ราคารวมค่าขนส่งเพิ่มเติม Fuel +3 บาท/ชิ้นแล้ว):</strong>
            <br>• ≤20ก. = <strong>23 บ.</strong> (20+3) | ≤100ก. = <strong>25 บ.</strong> (22+3) | ≤250ก. = <strong>29 บ.</strong> (26+3) | ≤500ก. = <strong>33 บ.</strong> (30+3) | ≤1กก. = <strong>43 บ.</strong> (40+3)
            <br>• ≤2กก. = <strong>63 บ.</strong> (60+3) | ≤3กก. = <strong>73 บ.</strong> | ≤4กก. = <strong>83 บ.</strong> | ≤5กก. = <strong>103 บ.</strong> | ≤6กก. = <strong>123 บ.</strong> | ≤7กก. = <strong>133 บ.</strong> | ≤8กก. = <strong>143 บ.</strong> | ≤9กก. = <strong>153 บ.</strong> | ≤10กก. = <strong>163 บ.</strong>
            <br>• <strong>กรณีปลายทางอยู่ใน 85 พื้นที่เกาะ/ห่างไกล/ท่องเที่ยว:</strong> บวกเพิ่มอีก <strong>+20 บาท/ชิ้น</strong>
          </li>
          <li class="critical"><strong>🚨 ข้อสังเกตสำคัญหน้าเคาน์เตอร์:</strong>
            <br>• <strong>พิกัดน้ำหนักสูงสุดไม่เกิน 10 กก.</strong> (ขนาดยาวสุดไม่เกิน 60 ซม. และ ก+ย+ส ไม่เกิน 120 ซม.)
            <br>• <strong>การติดตามสถานะ:</strong> แสดงสถานะในเว็บ Track & Trace <strong>3 จุดหลัก (รับฝากต้นทาง ➔ เตรียมการนำจ่าย ➔ นำจ่ายสำเร็จ)</strong>
            <br>• <strong>อัตราชดใช้ค่าเสียหาย:</strong> ชดใช้ตามจริงสูงสุด <strong>1,500 บาท/ชิ้น</strong> (คุ้มกว่าลงทะเบียน R และพัสดุ P!)
          </li>
        </ul>
      `;
    } else if (domWizSrv === "ems") {
      html = `
        <div style="color:#B91C1C; font-weight:700; font-size:15px; margin-bottom:8px;">
          ⚡ 7. บริการ EMS ในประเทศ (รหัส 831) & EMS ขนาดใหญ่ (รหัส 2886 — หารปริมาตร ÷ 6,000!)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="critical"><strong>🚨 กฎเหล็กแยก "EMS ปกติ (รหัส 831)" กับ "EMS ขนาดใหญ่ (รหัส 2886)":</strong>
            <br>• <strong>EMS ปกติ (รหัสบริการ <code>831</code>):</strong> ด้านยาวที่สุด <strong>ไม่เกิน 60 ซม.</strong> และผลรวม <code>กว้าง + ยาว + สูง ≤ 120 ซม.</code> (คิดเรทตามน้ำหนักชั่งจริง)
            <br>• <strong>EMS ขนาดใหญ่ (รหัสบริการ <code>2886</code>):</strong> เมื่อด้านใดด้านหนึ่ง <strong>ยาวเกิน 60 ซม.</strong> หรือผลรวม <code>กว้าง + ยาว + สูง &gt; 120 ซม.</code> (แต่ไม่เกิน 240 ซม. และด้านยาวสุดไม่เกิน 150 ซม.) ➔ <strong>ต้องคีย์รหัส <code>2886</code> และวัดขนาด <code>ก × ย × ส</code> กรอกลงใน CA POS ทุกครั้ง!</strong>
            <br>• <strong>สูตรน้ำหนักปริมาตรในประเทศ:</strong> <code>(กว้าง × ยาว × สูง ซม.) ÷ 6,000</code> = น้ำหนักปริมาตร (กก.) เทียบกับน้ำหนักชั่งจริง ตัวไหนมากกว่าคิดเรทนั้น! (ห้ามเผลอคีย์รหัส 831 เด็ดขาด เพราะจะโดนตรวจสอบย้อนหลัง!)
          </li>
          <li class="good"><strong>💰 อัตราค่าบริการ EMS ในประเทศ (ราคารวม Fuel Surcharge +3 บาท/ชิ้นแล้ว):</strong>
            <br>• ≤20ก.=<strong>35บ.</strong> | ≤100ก.=<strong>40บ.</strong> | ≤250ก.=<strong>45บ.</strong> | ≤500ก.=<strong>55บ.</strong> | ≤1กก.=<strong>70บ.</strong> | ≤1.5กก.=<strong>85บ.</strong> | ≤2กก.=<strong>100บ.</strong> | ≤2.5กก.=<strong>103บ.</strong> | ≤3กก.=<strong>108บ.</strong> | ≤3.5กก.=<strong>113บ.</strong> | ≤5กก.=<strong>123บ.</strong> | ≤10กก.=<strong>223บ.</strong> (สูงสุด 30 กก.)
            <br>• <strong>พื้นที่เกาะ/ห่างไกล 85 พื้นที่:</strong> บวกเพิ่ม <strong>+20 บาท/ชิ้น</strong> | <strong>ชดใช้ค่าเสียหายปกติ:</strong> สูงสุด <strong>2,000 บาท/ชิ้น</strong> (ซื้อ EMS รับประกันเพิ่มได้สูงสุด <strong>50,000 บาท</strong>)
          </li>
        </ul>
      `;
    } else if (domWizSrv === "jumbo") {
      html = `
        <div style="color:#9A3412; font-weight:700; font-size:15px; margin-bottom:8px;">
          🏍️ 8. บริการ EMS Jumbo (พิกัด 30–200 กก. & สินค้าสำเร็จรูป 44 รายการ 10 โซน + มอเตอร์ไซค์)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>📦 2 รูปแบบการคิดค่าบริการ EMS Jumbo (ขยายเวลามาตรการถึง 30 มิ.ย. 2570):</strong>
            <br>1. <strong>คิดตามพิกัดน้ำหนัก (ตั้งแต่ 30 กก. ขึ้นไป ถึง 200 กก.):</strong> ขนาดสูงสุดไม่เกิน <code>150 × 300 × 150 ซม.</code> (หากด้านใดเกิน 150 ซม. คิดค่าบริการส่วนเกินทุกๆ 50 ซม. ละ 100 / 200 / 300 บ.)
            <br>2. <strong>คิดตามสินค้าสำเร็จรูป 44 รายการ (แยกตาม 10 โซนจังหวัด):</strong> เช่น ทีวี, ตู้เย็น, เครื่องซักผ้า, ที่นอน, จักรยาน, กันชนรถยนต์ และ <strong>รถจักรยานยนต์</strong>:
            <br>&nbsp;&nbsp;• <strong>รถจักรยานยนต์ ≤150 CC:</strong> เริ่มต้น <strong>1,200 – 1,680 บาท</strong> (<em>หมายเหตุ: รุ่น 125 CC ให้คิดเรทเดียวกับ 150 CC!</em>)
            <br>&nbsp;&nbsp;• <strong>รถจักรยานยนต์ &gt;150 – 400 CC:</strong> เริ่มต้น <strong>1,500 – 2,100 บาท</strong> | <strong>&gt;400 CC (Big Bike):</strong> เริ่มต้น <strong>3,300 – 4,020 บาท</strong>
            <br>&nbsp;&nbsp;• <strong>บริการไปรับ (Pick-up) / นำส่งถึงบ้าน (Delivery):</strong> คิดเพิ่มเที่ยวละ <strong>60 – 500 บาท/ชิ้น</strong> ตามขั้นอัตราค่าฝากส่ง (และหากผู้รับไม่มารับที่ ปณ. ภายใน 7 วัน คิดค่าเก็บรักษา <strong>วันละ 25 บาท/ชิ้น</strong>)
          </li>
          <li class="critical"><strong>🚨 กฎเหล็กการรับฝาก "รถจักรยานยนต์" (ปณท รป.(รฝ.2)/363 & รป.(รฝ.2)/718):</strong>
            <br>1. <strong>ห้ามใช้กระดาษลูกฟูกสัมผัสชุดสีรถโดยตรงเด็ดขาด!</strong> ต้องหุ้มด้วย <strong>โฟม EPE (EPE Foam)</strong> รอบคันก่อน (หรือใช้ Air Bubble หนาหุ้มแล้วค่อยใช้กระดาษลูกฟูกปะทับ) + ถอดกระจกมองข้างออกแพ็คแยก + ถ่ายน้ำมันออกเหลือไม่เกิน 1/4 ถัง
            <br>2. <strong>ต้องจัดทำ "แบบตรวจสภาพรถจักรยานยนต์" จำนวน 3 ฉบับ:</strong> (1) ใส่ซองพลาสติกใสแนบติดตัวรถ (2) มอบให้ผู้ฝากส่งคู่ใบเสร็จ (3) เก็บไว้ที่ ปณ.ต้นทาง (กดสั่งพิมพ์แบบฟอร์ม A4 ได้ในแท็บ <strong>🖨️ แบบพิมพ์</strong>)
            <br>3. <strong>กำชับคีย์ข้อมูลผู้รับให้ครบถ้วนใน CA POS (บันทึก 718 ลว. 14 ก.ค. 69):</strong> แม้เป็นการส่งแบบรอจ่าย ณ ปณ.ปลายทาง เจ้าหน้าที่ต้นทาง <strong>ต้องคีย์บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด และเบอร์โทรผู้รับให้ครบถ้วนทุกช่อง!</strong>
            <br>4. <strong>อัตราชดใช้ค่าเสียหาย EMS Jumbo:</strong> ชดใช้ตามจริงสูงสุด <strong>3,000 บาท/ชิ้น</strong> (แนะนำลูกค้าซื้อประกันภัยเพิ่มได้สูงสุดถึง <strong>200,000 บาท/ชิ้น</strong>)
          </li>
        </ul>
      `;
    } else {
      html = `
        <div style="color:#065F46; font-weight:700; font-size:15px; margin-bottom:8px;">
          💡 9. คลังความรู้เสริมสำหรับพนักงานรับฝาก (COD T+1 • High Value/รับประกัน • EMS Point • ข้อ 186–189)
        </div>
        <ul class="notes-list" style="margin-top:0;">
          <li class="good"><strong>💸 1. บริการเก็บเงินปลายทาง COD (Wallet@POST — เกณฑ์ใหม่โอนเงิน T+1!):</strong>
            <br>• <strong>การสมัคร KYC 2 ขั้นตอน:</strong> (1) ลูกค้าถ่ายรูปบัตร ปชช. + เซลฟี่ในแอป Wallet@POST (2) <strong>นำบัตร ปชช. ตัวจริงมาเสียบเครื่องอ่านบัตร (Dip Chip) ณ ปณ.</strong> เพื่อยืนยันตัวตน
            <br>• <strong>โอนเงินเร็วขึ้น (มีผล 15 ก.ย. 2569):</strong> เมื่อผู้รับชำระเงินสำเร็จ ระบบจะโอนเงินเข้า Wallet@POST ของผู้ส่งใน <strong>วันทำการถัดไป (T+1) ก่อนเวลา 17.00 น.!</strong> (ค่าธรรมเนียม COD 3% ของยอดเรียกเก็บ วงเงินสูงสุด 50,000 บ./ชิ้น)
            <br>• <strong>เบอร์ติดต่อแก้ปัญหา COD ด่วน:</strong> เรื่องเงินโอน/e-Tax <code>0-2831-3019</code> | ปลดระงับ Wallet/2C2P <code>0-2831-3278</code> | เครื่อง Dip Chip ขัดข้อง <code>0-2831-3899</code> | Help Desk <code>0-2831-3660</code>
          </li>
          <li class="good" style="background:#EFF6FF; border-left-color:#2563EB; color:#1E3A8A;"><strong>💎 2. บริการจัดส่งสินค้ามูลค่าสูง (High Value — เริ่ม 14 ส.ค. 69) & EMS รับประกัน:</strong>
            <br>• หากลูกค้าส่งสิ่งของที่มีมูลค่า <strong>เกินกว่า 2,000 บาท</strong> (เช่น มือถือ ทองคำ นาฬิกา กล้อง พระเลี่ยมทอง) ให้แนะนำใช้บริการ <strong>EMS รับประกัน / สินค้ามูลค่าสูง (วงเงินสูงสุด 50,000 บาท)</strong> เสมอ!
            <br>• <strong>ข้อยกเว้นของ High Value:</strong> ไม่รับฝากสิ่งของที่เป็น <strong>ของเหลวทุกชนิด (เช่น น้ำหอม สุรา ไวน์)</strong> และ <strong>วัตถุมงคล/พระเครื่องที่ไม่สามารถประเมินมูลค่ามาตรฐานได้</strong>
            <br>• <strong>สูตรค่าบริการ EMS รับประกัน:</strong> ค่าปฏิบัติการ 15 บ. + ค่าประกันทุกๆ 500 บ. (วงเงิน <strong>500–20,000 บ. คิด 5 บ. ต่อ 500 บ.</strong> เช่น 5,000 บ. = 65 บ., 10,000 บ. = 115 บ., 20,000 บ. = 215 บ. | ส่วนที่เกิน <strong>20,001–50,000 บ. คิด 10 บ. ต่อ 500 บ.</strong> เช่น 50,000 บ. = 815 บ.)
          </li>
          <li class="critical"><strong>🏪 3. การรับมอบงานจากจุดบริการ EMS Point (ระบบ Post One / MPS):</strong>
            <br>• เมื่อร้านค้า EMS Point นำพัสดุมาส่งมอบที่ ปณ. เจ้าหน้าที่ต้องเข้าระบบ <strong>MPS (<code>https://postone.thailandpost.com/m</code>)</strong> เพื่อกด <strong>"รับมอบสิ่งของ"</strong> ให้ครบทุกชิ้น <strong>ก่อน</strong> นำไปสแกนเข้าระบบ TND เด็ดขาด!
            <br>• การรับชำระเงินในระบบ <strong>CA POS</strong>: เข้าเมนู <code>ใบแจ้งหนี้รายได้อื่น</code> ➔ ใช้รหัส <strong><code>694160</code> (EMS Point ประเภทซอง)</strong> หรือ <strong><code>694163</code> (EMS Point ประเภทกล่อง)</strong>
          </li>
          <li class="critical"><strong>⚖️ 4. เงื่อนไขการไม่ชดใช้ค่าเสียหาย (ระเบียบ Postal Guide ข้อ 186–189):</strong>
            <br>• ปณท <strong>ไม่ชดใช้ค่าเสียหาย</strong> ในกรณี: เหตุสุดวิสัย, ความเสียหายที่เกิดจาก <strong>สภาพแห่งสิ่งของนั้นเอง หรือการหุ้มห่อไม่มั่นคงแข็งแรงพอ</strong>, สิ่งของต้องห้าม, การฝากส่งเงินสด/ของมีค่าในบริการที่ไม่ได้รับประกัน และการไม่ยื่นเรื่องสอบสวนภายในกำหนด <strong>6 เดือน</strong> นับตั้งแต่วันถัดจากวันฝากส่ง
          </li>
        </ul>
      `;
    }

    out.innerHTML = html;
  }

  function setupDomWizardEvents() {
    const btns = document.querySelectorAll("#domWizGroup .pill-btn");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        domWizSrv = btn.getAttribute("data-dom-srv") || "letter";
        renderDomWizardOutput();
      });
    });
    renderDomWizardOutput();
  }

  // แปลงข้อความหลายบรรทัดให้กลายเป็นบล็อกบรรทัดย่อยที่อ่านง่าย สบายตา ข้อมูลยิบยับชัดเจน
  function formatMultilineToBlocks(text, borderColor) {
    if (!text) return "";
    const lines = String(text).split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return escapeHtml(text);
    }
    return `<div class="rate-formatted-lines">${lines
      .map(
        (line) =>
          `<div class="rate-line-item" style="border-left-color:${borderColor || "#059669"};">${escapeHtml(line)}</div>`
      )
      .join("")}</div>`;
  }

  function renderDomServices() {
    const container = document.getElementById("domServicesListContainer");
    if (!container || !DATA.domestic || !DATA.domestic.services) return;

    const themeClasses = [
      { cls: "theme-1-blue", color: "#1D4ED8" },
      { cls: "theme-2-purple", color: "#6D28D9" },
      { cls: "theme-3-emerald", color: "#047857" },
      { cls: "theme-4-amber", color: "#B45309" },
      { cls: "theme-5-cyan", color: "#0369A1" },
      { cls: "theme-6-teal", color: "#0F766E" },
      { cls: "theme-7-crimson", color: "#BE123C" },
      { cls: "theme-8-orange", color: "#C2410C" },
      { cls: "theme-9-slate", color: "#1E293B" }
    ];

    const srvHtml = DATA.domestic.services
      .map((srv, idx) => {
        const theme = themeClasses[idx % themeClasses.length];

        const formsHtml = (srv.requiredForms || [])
          .map((f) => `<li class="good" style="background:#EFF6FF; border-left-color:#2563EB; color:#1E3A8A; white-space:pre-line;">${escapeHtml(f)}</li>`)
          .join("");

        const survivalHtml = (srv.survivalGuide || [])
          .map((s) => `<li class="critical" style="white-space:pre-line;">${escapeHtml(s)}</li>`)
          .join("");

        const notesHtml = (srv.criticalNotes || [])
          .map((n) => {
            let cls = "good";
            if (n.includes("🚨") || n.includes("⚠️") || n.includes("ห้าม")) cls = "critical";
            return `<li class="${cls}" style="white-space:pre-line;">${escapeHtml(n)}</li>`;
          })
          .join("");

        return `
          <div class="card srv-theme-card ${theme.cls}" id="dom-service-${escapeHtml(srv.id)}">
            <div class="srv-theme-banner">
              <div>
                <span class="prefix-tag">${escapeHtml(srv.prefix)}</span>
                <div class="card-title">${escapeHtml(srv.name)}</div>
              </div>
              <span class="badge">${escapeHtml(srv.badge)}</span>
            </div>

            <div class="srv-theme-body">
              ${
                srv.posMode
                  ? `<div style="background:#FFFBEB; border:1.5px solid #F59E0B; border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:13.5px; font-weight:600; color:#92400E; white-space:pre-line;">
                      💻 <strong>การทำรายการในระบบ New CA POS / จุดรับฝาก:</strong>\n${escapeHtml(srv.posMode)}
                    </div>`
                  : ""
              }

              ${
                formsHtml
                  ? `<div style="font-size:14px; font-weight:700; color:#1E3A8A; margin-bottom:6px;">
                      📋 แบบพิมพ์ / ใบนำส่ง / ตราประทับที่ต้องใช้ในการรับฝาก:
                    </div>
                    <ul class="notes-list" style="margin-bottom:12px;">${formsHtml}</ul>`
                  : ""
              }

              ${
                survivalHtml
                  ? `<div style="font-size:14px; font-weight:700; color:#991B1B; margin-bottom:6px;">
                      🛡️ คัมภีร์เอาตัวรอดของเจ้าหน้าที่รับฝาก (ป้องกันคิดเงินผิด/ของตีกลับ/ถูกร้องเรียน):
                    </div>
                    <ul class="notes-list" style="margin-bottom:12px;">${survivalHtml}</ul>`
                  : ""
              }

              <div class="spec-grid" style="background:#FFFFFF; border:1.5px solid #CBD5E1;">
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label" style="color:${theme.color};">⚖️ พิกัดน้ำหนักสูงสุด</span>
                  <span class="spec-value" style="white-space:pre-line;">${escapeHtml(srv.maxWeight)}</span>
                </div>
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label" style="color:${theme.color};">📏 ขนาดสูงสุด / เงื่อนไขหุ้มห่อ</span>
                  <span class="spec-value" style="white-space:pre-line;">${escapeHtml(srv.maxSize)}</span>
                </div>
                <div class="spec-item" style="border-bottom:1px dashed #E2E8F0; padding-bottom:6px;">
                  <span class="spec-label" style="color:#047857; font-size:13.5px;">💰 ตารางสรุปอัตราค่าบริการ & ส่วนลด (แยกบรรทัดอ่านง่าย)</span>
                  <div class="spec-value">${formatMultilineToBlocks(srv.rateSummary, theme.color)}</div>
                </div>
                <div class="spec-item">
                  <span class="spec-label" style="color:#B91C1C;">🛡️ อัตราชดใช้ค่าเสียหาย & การรับประกัน</span>
                  <span class="spec-value" style="white-space:pre-line; font-weight:600;">${escapeHtml(srv.indemnity)}</span>
                </div>
              </div>

              <div style="font-size:14px; font-weight:700; color:var(--thp-navy); margin-bottom:6px;">
                📌 รายละเอียดเพิ่มเติม & ข้อสังเกตสำคัญหน้าเคาน์เตอร์:
              </div>
              <ul class="notes-list">${notesHtml}</ul>

              <div class="ref-foot">📄 อ้างอิงระเบียบ/บันทึก: ${escapeHtml(srv.ref)}</div>
            </div>
          </div>
        `;
      })
      .join("");

    // เพิ่มการ์ดตารางราคากล่อง ซอง และค่าบริการหุ้มห่อในประเทศแบบตารางละเอียดยิบ
    const boxDomHtml = `
      <div class="card srv-theme-card theme-4-amber" style="grid-column: 1 / -1;">
        <div class="srv-theme-banner">
          <div>
            <span class="prefix-tag">มาตรฐานบรรจุภัณฑ์ & ค่าหุ้มห่อ ปณท</span>
            <div class="card-title">📦 ตารางราคากล่องสำเร็จรูป ซองกันกระแทก และค่าบริการหุ้มห่อสิ่งของ (ครบทุกขนาด)</div>
          </div>
          <span class="badge">โพยราคากล่อง & ค่าห่อ</span>
        </div>
        <div class="srv-theme-body">
          <div class="dense-table-wrap">
            <table class="dense-table">
              <thead>
                <tr>
                  <th>ประเภทกล่อง / ซอง</th>
                  <th>ขนาด (กว้าง × ยาว × สูง ซม.)</th>
                  <th>ผลรวม 3 ด้าน</th>
                  <th>ราคาจำหน่ายเฉพาะกล่อง/ซอง</th>
                  <th>ค่าบริการหุ้มห่อ (กรณีให้ ปณ. ห่อให้)</th>
                  <th>รวมราคากล่อง + ค่าหุ้มห่อ</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>กล่องสำเร็จรูป ก</strong></td><td>14 × 20 × 6 ซม.</td><td>40 ซม.</td><td><span class="price-chip gold">9 บ.</span> (รุ่นใหม่ 12 บ.)</td><td>+6 บาท</td><td><strong>15 – 18 บาท</strong></td></tr>
                <tr><td><strong>กล่องสำเร็จรูป ข</strong></td><td>17 × 25 × 9 ซม.</td><td>51 ซม.</td><td><span class="price-chip gold">12 บ.</span> (รุ่นใหม่ 15 บ.)</td><td>+6 บาท</td><td><strong>18 – 21 บาท</strong></td></tr>
                <tr><td><strong>กล่องสำเร็จรูป ค</strong></td><td>20 × 30 × 11 ซม.</td><td>61 ซม.</td><td><span class="price-chip gold">16 บ.</span> (รุ่นใหม่ 20 บ.)</td><td>+6 บาท</td><td><strong>22 – 26 บาท</strong></td></tr>
                <tr><td><strong>กล่องสำเร็จรูป ง</strong></td><td>22 × 35 × 14 ซม.</td><td>71 ซม.</td><td><span class="price-chip gold">20 บ.</span> (รุ่นใหม่ 25 บ.)</td><td>+8 บาท</td><td><strong>28 – 33 บาท</strong></td></tr>
                <tr><td><strong>กล่องสำเร็จรูป จ</strong></td><td>24 × 40 × 17 ซม.</td><td>81 ซม.</td><td><span class="price-chip gold">25 บ.</span> (รุ่นใหม่ 32 บ.)</td><td>+8 บาท</td><td><strong>33 – 40 บาท</strong></td></tr>
                <tr><td><strong>กล่องสำเร็จรูป ฉ</strong></td><td>30 × 45 × 20 ซม.</td><td>95 ซม.</td><td><span class="price-chip gold">32 บ.</span> (รุ่นใหม่ 45 บ.)</td><td>+8 บาท</td><td><strong>40 – 53 บาท</strong></td></tr>
                <tr><td><strong>กล่องธรรมดา เบอร์ 1 (ทรงยาว)</strong></td><td>6 × 60 × 6 ซม.</td><td>72 ซม.</td><td><span class="price-chip blue">20 – 35 บ.</span></td><td>+15 บาท</td><td><strong>35 – 50 บาท</strong></td></tr>
                <tr><td><strong>กล่องธรรมดา เบอร์ 2</strong></td><td>10 × 50 × 20 ซม.</td><td>80 ซม.</td><td><span class="price-chip blue">20 – 30 บ.</span></td><td>+8 บาท</td><td><strong>28 – 38 บาท</strong></td></tr>
                <tr><td><strong>กล่องธรรมดา เบอร์ 3</strong></td><td>11 × 55 × 27 ซม.</td><td>93 ซม.</td><td><span class="price-chip blue">35 – 37 บ.</span></td><td>+8 บาท</td><td><strong>43 – 45 บาท</strong></td></tr>
                <tr><td><strong>กล่องธรรมดา เบอร์ 4 (ใหญ่ยาว)</strong></td><td>21 × 70 × 31 ซม.</td><td>122 ซม. (รหัส 2886)</td><td><span class="price-chip">65 – 80 บ.</span></td><td>+20 บาท</td><td><strong>85 – 100 บาท</strong></td></tr>
                <tr><td><strong>กล่องธรรมดา เบอร์ 5</strong></td><td>40 × 45 × 35 ซม.</td><td>120 ซม.</td><td><span class="price-chip">40 – 65 บ.</span></td><td>+15 บาท</td><td><strong>55 – 80 บาท</strong></td></tr>
                <tr><td><strong>กล่องธรรมดา เบอร์ 6 (จัมโบ้)</strong></td><td>45 × 55 × 40 ซม.</td><td>140 ซม. (รหัส 2886)</td><td><span class="price-chip">55 – 95 บ.</span></td><td>+15 บาท</td><td><strong>70 – 110 บาท</strong></td></tr>
                <tr class="highlight-row"><td><strong>กล่องที่ลูกค้านำมาเอง / อื่นๆ</strong></td><td colspan="2">ขนาดไม่เกิน 31×36×26 ซม. ค่าห่อ <strong>15 บ.</strong> | เกิน 31×36×26 ซม. ค่าห่อ <strong>25 บ.</strong></td><td colspan="3">กระดาษน้ำตาล ครึ่งแผ่น <strong>5 บ.</strong> / เต็มแผ่น <strong>10 บ.</strong> | ซองกันกระแทก C5=<strong>12 บ.</strong>, C4=<strong>17 บ.</strong> | บับเบิ้ล 65×65ซม.=<strong>7 บ.</strong></td></tr>
                <tr><td><strong>หุ้มห่อรถจักรยานยนต์ (EMS Jumbo)</strong></td><td colspan="2">หุ้มด้วยโฟม EPE รอบคัน + ถอดกระจกมองข้าง</td><td colspan="3">รถ ≤150 CC ค่าหุ้มห่อ <strong>360 บาท</strong> | รถ &gt;150–400 CC ค่าหุ้มห่อ <strong>450 บาท</strong> | รถ &gt;400 CC (Big Bike) ค่าหุ้มห่อ <strong>500 บาท</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div class="ref-foot">📄 อ้างอิง: ตารางราคาจำหน่ายกล่อง/ซอง และค่าบริการหุ้มห่อ ไปรษณีย์ไทย (บันทึก รบ.(รฝ.2)/180 และ รป.(รฝ.2)/363)</div>
        </div>
      </div>
    `;

    container.innerHTML = srvHtml + boxDomHtml;
  }

  function renderDomFormsHub() {
    const container = document.getElementById("domFormsHubContainer");
    if (!container || !DATA.domestic || !DATA.domestic.printableDocs) return;

    container.innerHTML = DATA.domestic.printableDocs.map((doc) => buildDocCardHtml(doc)).join("");
    attachDocActionEvents(container);
  }

  function renderDomPromos() {
    const clockBanner = document.getElementById("domPromoClockBanner");
    const activeContainer = document.getElementById("domActivePromosContainer");
    const expiredContainer = document.getElementById("domExpiredPromosContainer");
    if (!DATA.domestic || !DATA.domestic.promotions) return;

    if (clockBanner) {
      const now = new Date();
      const thaiDateStr = now.toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      clockBanner.innerHTML = `
        <h3 style="color:#1E40AF;">🕒 สถานะส่วนลด อัตราพิเศษ และค่าธรรมเนียมในประเทศ (วันนี้: ${escapeHtml(thaiDateStr)})</h3>
        <p style="color:#1E3A8A;">
          • <strong>🟢 กรอบสีเขียวเข้ม (มีให้ใช้อยู่ตอนนี้):</strong> ส่วนลดตามปริมาณงาน Admail, สื่อเลือกตั้ง 2.50 บ., หนังสือพิมพ์ตราสินลด 50%, เรทส่งยา รพ. และเกณฑ์ Fuel Surcharge +3 บ. / พื้นที่ห่างไกล +20 บ.<br>
          • <strong>🔴 กรอบสีเทาจาง + แถบสีแดงขีดฆ่า (ยกเลิก/เปลี่ยนแปลงแล้ว):</strong> อัตราเก่าที่ยกเลิกแล้ว แสดงแบบสีจางเพื่อป้องกันจำสับสน
        </p>
      `;
    }

    const activePromos = DATA.domestic.promotions.active || [];
    const expiredPromos = DATA.domestic.promotions.expired || [];

    if (activeContainer) {
      activeContainer.innerHTML = activePromos.map((p) => buildPromoCardHtml(p)).join("");
    }
    if (expiredContainer) {
      expiredContainer.innerHTML = expiredPromos.map((p) => buildPromoCardHtml(p)).join("");
    }
  }

  // เครื่องคำนวณค่าบริการในประเทศอัตโนมัติ (Domestic Rate, Volumetric 6000 & Admail/Trasin Calculator)
  function setupDomCalculator() {
    const btn = document.getElementById("runDomCalcBtn");
    const out = document.getElementById("domCalcResultBox");
    if (!btn || !out) return;

    function getEmsBaseByWeightG(weightG) {
      if (weightG > 30000) return null;
      if (weightG <= 20) return 32;
      if (weightG <= 100) return 37;
      if (weightG <= 250) return 42;
      if (weightG <= 500) return 52;
      if (weightG <= 1000) return 67;
      if (weightG <= 1500) return 82;
      if (weightG <= 2000) return 97;
      if (weightG <= 2500) return 100;
      if (weightG <= 3000) return 105;
      if (weightG <= 3500) return 110;
      if (weightG <= 5000) return 120;
      if (weightG <= 6000) return 140;
      if (weightG <= 7000) return 160;
      if (weightG <= 8000) return 180;
      if (weightG <= 9000) return 200;
      if (weightG <= 10000) return 220;
      const extraKg = Math.ceil((weightG - 10000) / 1000);
      return 220 + extraKg * 20;
    }

    function calculateDomRates() {
      const wG = parseFloat(document.getElementById("domCalcWeightG").value) || 0;
      const packType = document.getElementById("domCalcPackType").value; // "env" | "pack"
      const qty = Math.max(1, parseInt(document.getElementById("domCalcQty").value, 10) || 1);
      const addon = document.getElementById("domCalcAddon").value; // "none" | "ar" | "ear" | "remote" | "remote_ear"
      const dimW = parseFloat((document.getElementById("domCalcW") || {}).value) || 0;
      const dimL = parseFloat((document.getElementById("domCalcL") || {}).value) || 0;
      const dimH = parseFloat((document.getElementById("domCalcH") || {}).value) || 0;

      if (wG <= 0) {
        out.innerHTML = `<div style="color:#B91C1C; font-weight:600;">กรุณากรอกน้ำหนักชั่งจริงต่อชิ้น (กรัม) เช่น 50, 250, 1500, 12000</div>`;
        return;
      }

      const hasPaperAr = addon === "ar";
      const hasEAr = addon === "ear" || addon === "remote_ear";
      const isRemote = addon === "remote" || addon === "remote_ear";
      const remoteFee = isRemote ? 20 : 0;

      // คำนวณขนาดและน้ำหนักปริมาตรในประเทศ (ก×ย×ส ÷ 6,000)
      const hasDims = dimW > 0 && dimL > 0 && dimH > 0;
      const maxSide = hasDims ? Math.max(dimW, dimL, dimH) : 0;
      const sum3Sides = hasDims ? dimW + dimL + dimH : 0;
      const volWeightKg = hasDims ? (dimW * dimL * dimH) / 6000 : 0;
      const volWeightG = Math.round(volWeightKg * 1000);
      const isLargeEms2886 = hasDims && (maxSide > 60 || sum3Sides > 120) && sum3Sides <= 240 && maxSide <= 150;
      const isOverEmsLarge = hasDims && (sum3Sides > 240 || maxSide > 150);

      // 1. จดหมาย & ลงทะเบียน (R)
      let letterRate = null;
      let regRate = null;
      let letterTypeLabel = "";
      if (wG <= 2000 && (!hasDims || sum3Sides <= 90)) {
        if (packType === "env" && (!hasDims || sum3Sides <= 60)) {
          letterTypeLabel = "จดหมายซองกระดาษปกติ (ก+ย+ส ≤ 60 ซม.)";
          if (wG <= 10) letterRate = 5;
          else if (wG <= 20) letterRate = 6;
          else if (wG <= 100) letterRate = 11;
          else if (wG <= 250) letterRate = 17;
          else if (wG <= 500) letterRate = 23;
          else if (wG <= 1000) letterRate = 40;
          else letterRate = 62;
          regRate = letterRate + 13; // ลงทะเบียนซอง +13 บ.
        } else {
          letterTypeLabel = "จดหมายหีบห่อ (ซองพลาสติก/ซองป่อง/ซองขยายข้าง/กล่องเล็ก)";
          if (wG <= 500) letterRate = 34;
          else if (wG <= 1000) letterRate = 45;
          else letterRate = 62;
          regRate = letterRate + 15; // ลงทะเบียนหีบห่อ +15 บ.
        }
      }

      // 2. ของตีพิมพ์ & หนังสือพิมพ์ตราสิน (ลด 50% / 35% / 25%)
      let printedRate = null;
      if (wG <= 5000) {
        if (wG <= 50) printedRate = 4;
        else if (wG <= 100) printedRate = 5;
        else if (wG <= 250) printedRate = 8;
        else if (wG <= 500) printedRate = 11;
        else if (wG <= 1000) printedRate = 17;
        else if (wG <= 2000) printedRate = 33;
        else {
          const extraKg = Math.ceil((wG - 2000) / 1000);
          printedRate = 33 + extraKg * 16;
        }
      }

      let trasinTotal50 = null;
      let trasinTotal35 = null;
      let trasinTotal25 = null;
      if (printedRate !== null) {
        trasinTotal50 = Math.ceil(printedRate * 0.5 * qty * 4) / 4;
        trasinTotal35 = Math.ceil(printedRate * 0.65 * qty * 4) / 4;
        trasinTotal25 = Math.ceil(printedRate * 0.75 * qty * 4) / 4;
      }

      // 3. ไปรษณียภัณฑ์ไม่มีจ่าหน้า (Admail) - สูงสุด 500 กรัม (ระเบียบฉบับที่ 215)
      let admailRatePerPc = null;
      let admailTierName = "";
      if (wG <= 500) {
        let wIdx = 0;
        if (wG <= 50) wIdx = 0;
        else if (wG <= 100) wIdx = 1;
        else if (wG <= 250) wIdx = 2;
        else wIdx = 3;

        const admailMatrix = [
          { max: 5000, label: "ไม่เกิน 5,000 ชิ้น", rates: [3.5, 4.5, 6.5, 9.5] },
          { max: 20000, label: "5,001 – 20,000 ชิ้น", rates: [3.0, 4.0, 6.0, 9.0] },
          { max: 50000, label: "20,001 – 50,000 ชิ้น", rates: [2.75, 3.75, 5.75, 8.75] },
          { max: Infinity, label: "ตั้งแต่ 50,001 ชิ้นขึ้นไป", rates: [2.5, 3.5, 5.5, 8.5] }
        ];

        const tier = admailMatrix.find((t) => qty <= t.max);
        admailRatePerPc = tier.rates[wIdx];
        admailTierName = tier.label;
      }

      // 4. พัสดุไปรษณีย์ (P) - สูงสุด 20 กก. (20,000 กรัม)
      let parcelRate = null;
      if (wG <= 20000) {
        const kgCeil = Math.max(1, Math.ceil(wG / 1000));
        parcelRate = 25 + (kgCeil - 1) * 20;
      }

      // 5. eCo-Post (O) - สูงสุด 10 กก., ยาวสุด ≤60 ซม., ก+ย+ส ≤120 ซม. (+Fuel 3 บ. +Remote 20 บ.)
      let ecoBase = null;
      const ecoSizeOk = !hasDims || (maxSide <= 60 && sum3Sides <= 120);
      if (wG <= 10000 && ecoSizeOk) {
        if (wG <= 20) ecoBase = 20;
        else if (wG <= 100) ecoBase = 22;
        else if (wG <= 250) ecoBase = 26;
        else if (wG <= 500) ecoBase = 30;
        else if (wG <= 1000) ecoBase = 40;
        else if (wG <= 2000) ecoBase = 60;
        else if (wG <= 3000) ecoBase = 70;
        else if (wG <= 4000) ecoBase = 80;
        else if (wG <= 5000) ecoBase = 100;
        else if (wG <= 6000) ecoBase = 120;
        else if (wG <= 7000) ecoBase = 130;
        else if (wG <= 8000) ecoBase = 140;
        else if (wG <= 9000) ecoBase = 150;
        else ecoBase = 160;
      }

      // 6. EMS ปกติ (รหัส 831) vs EMS ขนาดใหญ่ (รหัส 2886)
      const effectiveEmsWeightG = isLargeEms2886 ? Math.max(wG, volWeightG) : wG;
      const emsBase = !isOverEmsLarge ? getEmsBaseByWeightG(effectiveEmsWeightG) : null;
      const arFeeReg = hasPaperAr ? 3 : hasEAr ? 5 : 0;
      const arFeeParcel = hasPaperAr ? 6 : hasEAr ? 5 : 0;
      const arFeeEms = hasPaperAr ? 10 : hasEAr ? 5 : 0;

      out.innerHTML = `
        <div class="spec-grid" style="background:#EFF6FF; border-color:#93C5FD;">
          ${
            hasDims
              ? `<div class="spec-item" style="border-bottom:1px solid #BFDBFE; padding-bottom:6px; background:#FFFBEB; padding:8px; border-radius:8px;">
                  <span class="spec-label" style="color:#B45309;">📐 ผลตรวจขนาดกล่อง (${dimW} × ${dimL} × ${dimH} ซม. | รวม 3 ด้าน = ${sum3Sides} ซม. | ยาวสุด = ${maxSide} ซม.)</span>
                  <span class="spec-value">
                    • น้ำหนักปริมาตรในประเทศ (<code>ก×ย×ส ÷ 6,000</code>): <strong>${volWeightKg.toFixed(2)} กก. (${volWeightG.toLocaleString()} กรัม)</strong> vs น้ำหนักชั่งจริง <strong>${(wG / 1000).toFixed(2)} กก.</strong><br>
                    • <strong>รหัสบริการ EMS ที่ต้องใช้:</strong> ${
                      isOverEmsLarge
                        ? `<span style="color:#B91C1C; font-weight:700;">🚨 เกินเกณฑ์ EMS ขนาดใหญ่ (ก+ย+ส &gt; 240 ซม. หรือยาว &gt; 150 ซม.) ➔ ต้องใช้บริการ 8. EMS Jumbo เท่านั้น!</span>`
                        : isLargeEms2886
                        ? `<span style="color:#B91C1C; font-weight:700;">🔴 ต้องคีย์รหัส <code>2886</code> (EMS ขนาดใหญ่) และกรอก ก×ย×ส ใน CA POS! (คิดเรทจาก ${ (effectiveEmsWeightG / 1000).toFixed(2) } กก.)</span>`
                        : `<span style="color:#047857; font-weight:700;">🟢 ใช้รหัส <code>831</code> (EMS ปกติ) ได้ (ยาวสุด ≤60 ซม. และ ก+ย+ส ≤120 ซม.)</span>`
                    }
                  </span>
                </div>`
              : ""
          }
          <div class="spec-item" style="border-bottom:1px solid #BFDBFE; padding-bottom:6px;">
            <span class="spec-label" style="color:#1E40AF;">✉️ 1 & 5. ${escapeHtml(letterTypeLabel || "จดหมาย & ลงทะเบียนในประเทศ (R...TH)")}</span>
            <span class="spec-value">
              ${
                letterRate !== null
                  ? `• ส่งธรรมดา: <strong>${letterRate} บาท/ชิ้น</strong> | <strong>ลงทะเบียนในประเทศ (R): ${regRate + arFeeReg} บาท/ชิ้น</strong> (ค่าส่ง ${letterRate} + ค่าลงทะเบียน ${regRate - letterRate}${arFeeReg ? ` + ตอบรับ ${arFeeReg} บ.` : ""})`
                  : `❌ น้ำหนักหรือขนาดเกินพิกัดจดหมาย/ลงทะเบียน (รับได้สูงสุด 2,000 กรัม และ ก+ย+ส ไม่เกิน 90 ซม.)`
              }
            </span>
          </div>
          <div class="spec-item" style="border-bottom:1px solid #BFDBFE; padding-bottom:6px;">
            <span class="spec-label" style="color:#047857;">📚 1 & 2. ของตีพิมพ์ & หนังสือพิมพ์ตราสิน (ป.244)</span>
            <span class="spec-value">
              ${
                printedRate !== null
                  ? `• ของตีพิมพ์ปกติ: <strong>${printedRate} บาท/ชิ้น</strong> (ลงทะเบียนสิ่งพิมพ์ R = <strong>${printedRate + 13 + arFeeReg} บาท</strong>)<br>
                     • 📰 <strong>หนังสือพิมพ์ตราสิน (${qty.toLocaleString()} ฉบับ):</strong> รายวัน (ลด 50%) = <strong>${trasinTotal50.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บ.</strong> | รายสัปดาห์/ปักษ์ (ลด 35%) = <strong>${trasinTotal35.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บ.</strong> | รายเดือน (ลด 25%) = <strong>${trasinTotal25.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บ.</strong> ${qty < 100 ? "<span style='color:#B91C1C; font-weight:700;'>(⚠️ ตราสินต้องส่งขั้นต่ำ 100 ฉบับ)</span>" : "✅"}`
                  : `❌ น้ำหนักเกินพิกัดของตีพิมพ์ (รับได้สูงสุด 5,000 กรัม เฉพาะหนังสือ)`
              }
            </span>
          </div>
          <div class="spec-item" style="border-bottom:1px solid #BFDBFE; padding-bottom:6px;">
            <span class="spec-label" style="color:#9A3412;">📢 3. ไปรษณียภัณฑ์ไม่มีจ่าหน้า (Admail — จำนวน ${qty.toLocaleString()} ชิ้น)</span>
            <span class="spec-value">
              ${
                admailRatePerPc !== null
                  ? `• เรทปกติ (ขั้นปริมาณ <em>${admailTierName}</em>): ชิ้นละ <strong>${admailRatePerPc.toFixed(2)} บาท</strong> ➔ รวมทั้งสิ้น <strong>${(admailRatePerPc * qty).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</strong><br>
                     ${wG <= 50 ? `• 🗳️ <strong>กรณีสื่อหาเสียงเลือกตั้ง (≤50ก. ไม่มีขั้นต่ำ):</strong> ชิ้นละ <strong>2.50 บาท</strong> ➔ รวมทั้งสิ้น <strong>${(2.5 * qty).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</strong>` : ""}`
                  : `❌ น้ำหนักเกินพิกัด Admail (รับได้สูงสุดไม่เกิน 500 กรัม/ชิ้น)`
              }
            </span>
          </div>
          <div class="spec-item">
            <span class="spec-label" style="color:#B91C1C;">📦 4, 6, 7, 8. พัสดุ (P) vs eCo-Post (O) vs EMS (831 / 2886) vs EMS Jumbo</span>
            <span class="spec-value">
              • <strong>4. พัสดุไปรษณีย์ (P):</strong> ${parcelRate !== null ? `<strong>${parcelRate + arFeeParcel} บาท/ชิ้น</strong> (ไม่เสีย Fuel +3 บ. / เช็คออนไลน์ไม่ได้ / ชดใช้สูงสุด 1,000 บ.)` : "❌ เกิน 20 กก."}<br>
              • <strong>6. eCo-Post (O):</strong> ${ecoBase !== null ? `<strong>${ecoBase + 3 + remoteFee} บาท/ชิ้น</strong> (ค่าส่ง ${ecoBase} + Fuel 3 บ.${isRemote ? " + พื้นที่ห่างไกล 20 บ." : ""} | ชดใช้สูงสุด 1,500 บ.)` : "❌ เกินพิกัด eCo-Post (จำกัด ≤10 กก., ยาวสุด ≤60 ซม., ก+ย+ส ≤120 ซม.)"}<br>
              • <strong>7. EMS ในประเทศ (${isLargeEms2886 ? "รหัส 2886 EMS ขนาดใหญ่" : "รหัส 831 EMS ปกติ"}):</strong> ${emsBase !== null ? `<strong>${emsBase + 3 + remoteFee + arFeeEms} บาท/ชิ้น</strong> (ค่าส่ง ${emsBase} + Fuel 3 บ.${isRemote ? " + พื้นที่ห่างไกล 20 บ." : ""}${arFeeEms ? ` + ตอบรับ ${arFeeEms} บ.` : ""} | ชดใช้สูงสุด 2,000 บ.)` : "❌ เกินพิกัด 30 กก. หรือเกินขนาด 240 ซม. ➔ ใช้ <strong>8. EMS Jumbo (30–200 กก. / สินค้าสำเร็จรูป)</strong>"}
            </span>
          </div>
        </div>
      `;
    }

    btn.addEventListener("click", calculateDomRates);
    calculateDomRates();
  }

  // 8. ระบบสลับโหมดทางเข้าแรก (Domestic vs International) & สลับแท็บด้านล่าง
  function switchAppMode(mode) {
    currentMode = mode === "inter" ? "inter" : "domestic";

    document.body.classList.toggle("mode-domestic", currentMode === "domestic");
    document.body.classList.toggle("mode-inter", currentMode === "inter");

    const domWrapper = document.getElementById("mode-domestic-wrapper");
    const interWrapper = document.getElementById("mode-inter-wrapper");
    const navBtnDest = document.getElementById("navBtnDest");
    const navBtnProhib = document.getElementById("navBtnProhib");
    const navLabelServices = document.getElementById("navLabelServices");
    const gwBadgeDom = document.getElementById("gwBadgeDom");
    const gwBadgeInter = document.getElementById("gwBadgeInter");
    const headerMainTitle = document.getElementById("headerMainTitle");

    // อัปเดตปุ่มบน Header และการ์ดทางเข้าหลัก
    document.querySelectorAll("[data-mode]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-mode") === currentMode);
    });

    if (headerMainTitle) {
      headerMainTitle.textContent =
        currentMode === "domestic"
          ? "คู่มือบริการในประเทศ"
          : "คู่มือบริการระหว่างประเทศ";
    }

    if (gwBadgeDom && gwBadgeInter) {
      if (currentMode === "domestic") {
        gwBadgeDom.className = "badge badge-amber";
        gwBadgeDom.textContent = "กำลังใช้งาน";
        gwBadgeInter.className = "badge badge-slate";
        gwBadgeInter.textContent = "สลับโหมด";
      } else {
        gwBadgeInter.className = "badge badge-blue";
        gwBadgeInter.textContent = "กำลังใช้งาน";
        gwBadgeDom.className = "badge badge-slate";
        gwBadgeDom.textContent = "สลับโหมด";
      }
    }

    if (domWrapper) domWrapper.style.display = currentMode === "domestic" ? "block" : "none";
    if (interWrapper) interWrapper.style.display = currentMode === "inter" ? "block" : "none";

    // ซ่อน/แสดงปุ่มประเทศและของต้องห้ามเฉพาะโหมดระหว่างประเทศ
    if (navBtnDest) navBtnDest.style.display = currentMode === "inter" ? "flex" : "none";
    if (navBtnProhib) navBtnProhib.style.display = currentMode === "inter" ? "flex" : "none";
    if (navLabelServices) {
      navLabelServices.textContent = currentMode === "domestic" ? "บริการ (9)" : "บริการ";
    }

    // หากสลับมาโหมดในประเทศแต่แท็บเดิมอยู่ที่ ประเทศ/ของต้องห้าม ให้เด้งกลับมาที่ เช็คด่วน
    let activeNav = document.querySelector(".bottom-nav .nav-btn.active");
    let rawTab = activeNav ? activeNav.getAttribute("data-tab") : "tab-quick";
    if (currentMode === "domestic" && (rawTab === "tab-destinations" || rawTab === "tab-prohibited")) {
      rawTab = "tab-quick";
      document.querySelectorAll(".bottom-nav .nav-btn").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-tab") === "tab-quick");
      });
    }

    const targetSectionId = currentMode === "domestic" ? "dom-" + rawTab : rawTab;
    document.querySelectorAll(".tab-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === targetSectionId);
    });

    // ปิดหน้าค้นหาหากเปิดค้างไว้
    const searchSection = document.getElementById("searchResultsSection");
    const searchInput = document.getElementById("globalSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    if (searchSection) searchSection.style.display = "none";
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
  }

  function setupModeGateway() {
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        switchAppMode(mode);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupTabNavigation() {
    const navBtns = document.querySelectorAll(".bottom-nav .nav-btn");
    const tabSections = document.querySelectorAll(".tab-section");
    const searchSection = document.getElementById("searchResultsSection");
    const searchInput = document.getElementById("globalSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const rawTab = btn.getAttribute("data-tab");
        const targetId = currentMode === "domestic" ? "dom-" + rawTab : rawTab;

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

    // โหลดข้อมูลโหมดในประเทศ (Domestic)
    setupDomWizardEvents();
    renderDomServices();
    renderDomFormsHub();
    renderDomPromos();
    setupDomCalculator();

    // โหลดข้อมูลโหมดระหว่างประเทศ (International)
    setupWizardEvents();
    renderServices();
    renderFormsHub();
    renderDestinations();
    renderProhibited();
    renderPromosAndContacts();
    setupCalculator();

    // ระบบค้นหารวม + สลับโหมดทางเข้าแรก + แท็บเมนู
    setupGlobalSearch();
    setupModeGateway();
    setupTabNavigation();
    switchAppMode("domestic");
  });
})();
