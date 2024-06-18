// Copilot v2 to analyze patient data and provide personalized treatment plans, medication recommendations, or therapy options for pre-stage imaging tasks

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

// 1. Initialize superbase client and openai api
const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_KEY);

const openai = new OpenAI({
	apiKey: process.env.OPENAPI_KEY, // This is the default and can be omitted
});

// 2. generate embeddings
async function generateEmbeddings() {
	// 2.1. create some custom data (vinmec)
	const documents = [
		"Bệnh nhân Đinh Công Duy sinh ngày 17 tháng 5 năm 1970, đang là một giáo viên sắp về hưu, có 3 người con, 2 gái, 1 trai",
		"Bệnh nhân Đinh Công Duy có tiền sử cao huyết áp và dị ứng hải sản",
		"Bệnh nhân Đinh Công Duy bị giãn dây chằn do trước đây vận động nhiều ở chân",
		"Bệnh nhân Đinh Công Duy hay bị đau nửa đầu khi vào thời gian thi cử do áp lực giảng dạy",

		"Bệnh nhân Lê Thị Hồng Nhung sinh ngày 12 tháng 2 năm 1965, là một nhân viên kế toán, có 2 người con, 1 gái, 1 trai.",
		"Bệnh nhân Lê Thị Hồng Nhung có tiền sử tiểu đường và dị ứng phấn hoa.",
		"Bệnh nhân Lê Thị Hồng Nhung bị thoái hóa đốt sống cổ do ngồi làm việc lâu.",
		"Bệnh nhân Lê Thị Hồng Nhung hay bị mất ngủ do căng thẳng công việc và áp lực gia đình.",

		"Bệnh nhân Nguyễn Văn Bình sinh ngày 25 tháng 8 năm 1975, là một kỹ sư xây dựng, có 1 người con trai.",
		"Bệnh nhân Nguyễn Văn Bình có tiền sử cao huyết áp và dị ứng thuốc kháng sinh.",
		"Bệnh nhân Nguyễn Văn Bình bị thoát vị đĩa đệm do lao động nặng.",
		"Bệnh nhân Nguyễn Văn Bình thường xuyên bị stress và đau đầu do áp lực công việc và dự án.",

		"Bệnh nhân Trần Thị Lan sinh ngày 3 tháng 3 năm 1980, là một nhân viên văn phòng, có 2 người con, 1 gái, 1 trai.",
		"Bệnh nhân Trần Thị Lan có tiền sử hen suyễn và dị ứng lông thú.",
		"Bệnh nhân Trần Thị Lan bị viêm khớp gối do thiếu vận động.",
		"Bệnh nhân Trần Thị Lan hay bị chóng mặt và mệt mỏi do công việc căng thẳng và thiếu ngủ.",

		"Bệnh nhân Phạm Minh Hoàng sinh ngày 10 tháng 10 năm 1968, là một lái xe tải, có 3 người con, 2 gái, 1 trai.",
		"Bệnh nhân Phạm Minh Hoàng có tiền sử bệnh gan và dị ứng với nấm mốc.",
		"Bệnh nhân Phạm Minh Hoàng bị viêm gân cổ tay do lái xe nhiều.",
		"Bệnh nhân Phạm Minh Hoàng thường xuyên bị đau lưng và căng cơ do công việc lái xe.",

		"Bệnh nhân Nguyễn Thị Hạnh sinh ngày 14 tháng 6 năm 1973, là một đầu bếp, có 2 người con trai.",
		"Bệnh nhân Nguyễn Thị Hạnh có tiền sử bệnh dạ dày và dị ứng sữa.",
		"Bệnh nhân Nguyễn Thị Hạnh bị viêm khớp tay do công việc bếp núc.",
		"Bệnh nhân Nguyễn Thị Hạnh hay bị lo âu và đau đầu do áp lực công việc và gia đình.",

		"Bệnh nhân Trần Văn Cường sinh ngày 20 tháng 11 năm 1971, là một nhân viên bảo vệ, có 1 người con gái.",
		"Bệnh nhân Trần Văn Cường có tiền sử bệnh tim và dị ứng hải sản.",
		"Bệnh nhân Trần Văn Cường bị giãn tĩnh mạch chân do đứng nhiều.",
		"Bệnh nhân Trần Văn Cường thường xuyên bị mất ngủ và lo lắng do công việc căng thẳng.",

		"Bệnh nhân Lê Minh Tú sinh ngày 30 tháng 5 năm 1976, là một nhà báo, có 2 người con gái.",
		"Bệnh nhân Lê Minh Tú có tiền sử suy thận và dị ứng thuốc kháng sinh.",
		"Bệnh nhân Lê Minh Tú bị thoái hóa khớp gối do công việc di chuyển nhiều.",
		"Bệnh nhân Lê Minh Tú hay bị căng thẳng và đau đầu do áp lực công việc và deadline.",

		"Bệnh nhân Phạm Thị Thu sinh ngày 8 tháng 1 năm 1982, là một giáo viên mầm non, có 1 người con trai.",
		"Bệnh nhân Phạm Thị Thu có tiền sử viêm xoang và dị ứng phấn hoa.",
		"Bệnh nhân Phạm Thị Thu bị đau cổ tay do công việc chăm sóc trẻ.",
		"Bệnh nhân Phạm Thị Thu thường xuyên bị mệt mỏi và thiếu ngủ do công việc và gia đình.",

		"Bệnh nhân Nguyễn Văn Hùng sinh ngày 19 tháng 9 năm 1969, là một nhân viên bưu điện, có 3 người con, 2 trai, 1 gái.",
		"Bệnh nhân Nguyễn Văn Hùng có tiền sử bệnh thận và dị ứng côn trùng.",
		"Bệnh nhân Nguyễn Văn Hùng bị viêm khớp lưng do công việc mang vác nặng.",
		"Bệnh nhân Nguyễn Văn Hùng hay bị đau đầu và mất ngủ do áp lực công việc và gia đình.",

		"Bệnh nhân Đặng Thị Thanh sinh ngày 5 tháng 7 năm 1974, là một thợ may, có 2 người con gái.",
		"Bệnh nhân Đặng Thị Thanh có tiền sử bệnh tiểu đường và dị ứng hải sản.",
		"Bệnh nhân Đặng Thị Thanh bị đau vai gáy do ngồi may lâu.",
		"Bệnh nhân Đặng Thị Thanh thường xuyên bị đau đầu và mệt mỏi do công việc và thiếu nghỉ ngơi.",

		// không nghiêm trọng
		"Bệnh nhân Tô Minh Hoàng sinh ngày 17 tháng 1 năm 1991, đang là chuyên gia marketing, có 6 người con, 3 gái, 2 trai và một con rơi",
		"Bệnh nhân Tô Minh Hoàng có tiền sử đau đầu và dị ứng da liễu",
		"Bệnh nhân Tô Minh Hoàng bị đau cổ tay do chơi game quá nhiều",
		"Bệnh nhân Tô Minh Hoàng hay bị đau tay trái mỗi khi mùa xuân tới vì kí ức đau buồn sau khi thua 3-2 giải đấu PES",

		"Bệnh nhân Nông Thị Hoa sinh ngày 02 tháng 09 năm 2003, đang là sinh viên đại học Hà Nội, chuyên ngành tiếng Đức, có 2 anh trai và 1 em gái",
		"Bệnh nhân Nông Thị Hoa có tiền sử trầm cảm và đau lưng do học quá nhiều",
		"Bệnh nhân Nông Thị Hoa bị giảm thính lực vì nghe nhạc Rock quá nhiều",
		"Bệnh nhân Nông Thị Hoa hay bị ù tai khi nghe nhạc của anh Thắng Ngọt vì hậu quả của việc chia tay trong quá khứ",

		// đau bụng 1
		"Bệnh nhân Hoàng Thị Hường sinh ngày 15 tháng 4 năm 1985, là một nhân viên văn phòng, có 1 con gái.",
		"Bệnh nhân Hoàng Thị Hường có tiền sử viêm loét dạ dày và dị ứng phấn hoa.",
		"Bệnh nhân Hoàng Thị Hường bị đau bụng thường xuyên sau khi ăn, kèm triệu chứng buồn nôn và ợ nóng.",
		"Bệnh nhân Hoàng Thị Hường thường xuyên bị căng thẳng và mệt mỏi do công việc và gia đình.",

		// đau bụng 2
		// "Bệnh nhân Trần Văn Hòa sinh ngày 22 tháng 2 năm 1972, là một lái xe buýt, có 2 con trai.",
		// "Bệnh nhân Trần Văn Hòa có tiền sử hội chứng ruột kích thích và dị ứng tôm.",
		// "Bệnh nhân Trần Văn Hòa bị đau bụng quặn và tiêu chảy kèm triệu chứng đầy hơi và khó chịu.",
		// "Bệnh nhân Trần Văn Hòa hay bị căng thẳng và lo âu do công việc và áp lực tài chính.",
		"Bệnh nhân Phan Vũ Anh Tiến sinh ngày 22 tháng 2 năm 1972, là một lái xe buýt, có 2 con trai.",
		"Bệnh nhân Phan Vũ Anh Tiến có tiền sử hội chứng ruột kích thích và dị ứng tôm.",
		"Bệnh nhân Phan Vũ Anh Tiến bị đau bụng quặn và tiêu chảy kèm triệu chứng đầy hơi và khó chịu.",
		"Bệnh nhân Phan Vũ Anh Tiến hay bị căng thẳng và lo âu do công việc và áp lực tài chính.",

		// trở nặng 1
		"Bệnh nhân Nguyễn Thị Mai sinh ngày 17 tháng 1 năm 1950, là một nội trợ, có 3 con, 2 gái, 1 trai.",
		"Bệnh nhân Nguyễn Thị Mai có tiền sử ung thư gan giai đoạn cuối và dị ứng thuốc giảm đau.",
		"Bệnh nhân Nguyễn Thị Mai bị đau bụng, vàng da và mệt mỏi cực độ.",
		"Bệnh nhân Nguyễn Thị Mai tình trạng sức khỏe ngày càng suy giảm và tiên lượng xấu.",

		// trở nặng 2
		"Bệnh nhân Phạm Văn An sinh ngày 10 tháng 9 năm 1965, là một công nhân xây dựng, có 2 con gái.",
		"Bệnh nhân Phạm Văn An có tiền sử suy thận mạn tính giai đoạn cuối và dị ứng penicillin.",
		"Bệnh nhân Phạm Văn An bị suy nhược cơ thể và khó thở.",
		"Bệnh nhân Phạm Văn An tình trạng bệnh đang tiến triển nặng và sắp tử vong.",

		// trở nặng 3
		"Bệnh nhân Phạm Văn Chiến sinh ngày 20 tháng 12 năm 2008, là một học sinh cấp 3.",
		"Bệnh nhân Phạm Văn Chiến có cơ địa khó đông máu và dễ bị sẹo lồi sau tổn thương da",
		"Bệnh nhân Phạm Văn Chiến vừa bị tai nạn giao thông và thương tích 70%",
		"Bệnh nhân Phạm Văn Chiến sau khi được cấp cứu thì bác sĩ gửi về nhà cho gia đình có hướng xử lý tiếp theo vì gần như không thể qua khỏi nữa",

		// mãn tính: hen suyễn
		"Bệnh nhân Phạm Thị Hương sinh ngày 17 tháng 11 năm 2000, là một nhân viên văn phòng.",
		"Bệnh nhân Phạm Thị Hương từ lúc 15 tuổi cho đến nay có lịch sử bị hen suyễn",
		"Bệnh nhân Phạm Thị Hương ít vận động thể thao và thường xuyên ngồi lì trong phòng kín",
		"Bệnh nhân Phạm Thị Hương thường xuyên sử dụng thuốc xịt hen",

		// mãn tính: hen suyễn
		"Bệnh nhân Tô Bá Cường sinh ngày 09 tháng 11 năm 1944, là một thợ máy đã nghỉ hưu",
		"Bệnh nhân Tô Bá Cường từ lúc 60 tuổi đến hay hay bị chứng mất trí nhớ và lẫn do tuổi già",
		"Bệnh nhân Tô Bá Cường trước đây được bác sĩ ở bệnh viện khác dặn dò theo dõi thường xuyên, giữ trạng thái tích cực",
	];

	for (let i = 0; i < documents.length; i++) {
		const doc = documents[i];
		console.log("---processing pre-data: ", doc);
		const input = doc.replace(/\n/g, '');
		// 2.2. turn string of custom data into vector (embedding)
		const embeddingResponse = await openai.embeddings.create({
			model: "text-embedding-ada-002", // Model that creates our embeddings
			input
		});
		const embedding = embeddingResponse?.data[0]?.embedding;

		// 2.3. store embedding and text in supabase DB
		await supabaseClient.from('documents').insert({
			content: doc,
			embedding
		});
		console.log(`---done ${i + 1}/${documents.length}`, doc);
	}
}

generateEmbeddings();

