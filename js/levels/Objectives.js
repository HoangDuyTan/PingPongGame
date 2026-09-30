const LEVEL_OBJECTIVES = {
    1: {
        name: "Classic",
        objective: "Phá hủy toàn bộ mục tiêu để hoàn thành màn chơi.",
        mechanic: "Điều khiển paddle và thay đổi hướng bóng bằng vị trí va chạm.",
        tip: "Đánh bóng vào mép paddle để điều chỉnh hướng bóng chính xác hơn."
    },

    2: {
        name: "Moving Targets",
        objective: "Phá hủy toàn bộ mục tiêu đang di chuyển.",
        mechanic: "Các mục tiêu sẽ liên tục di chuyển sang trái và phải.",
        tip: "Quan sát hướng di chuyển của mục tiêu và đưa bóng tới vị trí mà mục tiêu sắp đi qua."
    },

    3: {
        name: "Wall Obstacles",
        objective: "Phá hủy toàn bộ mục tiêu phía sau các chướng ngại vật.",
        mechanic: "Các bức tường sẽ làm thay đổi hướng di chuyển của bóng.",
        tip: "Tận dụng góc phản xạ từ tường để đưa bóng tới những mục tiêu khó tiếp cận."
    },

    4: {
        name: "Invisible Targets",
        objective: "Phá hủy toàn bộ mục tiêu kể cả khi chúng tạm thời biến mất.",
        mechanic: "Các mục tiêu sẽ ẩn và hiện theo chu kỳ.",
        tip: "Ghi nhớ vị trí của mục tiêu trước khi chúng biến mất."
    },

    5: {
        name: "Multi Ball",
        objective: "Kiểm soát nhiều bóng cùng lúc và phá hủy toàn bộ mục tiêu.",
        mechanic: "Hai quả bóng sẽ cùng xuất hiện trên sân.",
        tip: "Ưu tiên giữ cả hai bóng trên sân để phá mục tiêu nhanh hơn."
    },

    6: {
        name: "Invisible Ball",
        objective: "Phá hủy toàn bộ mục tiêu trong khi bóng có thể biến mất.",
        mechanic: "Bóng sẽ tạm thời vô hình nhưng vẫn tiếp tục di chuyển.",
        tip: "Theo dõi hướng và tốc độ của bóng trước khi nó biến mất để dự đoán vị trí tiếp theo."
    },

    7: {
        name: "Bomb & Trap",
        objective: "Tận dụng bom để phá mục tiêu và tránh các bẫy nguy hiểm.",
        mechanic: "Bom có thể phá nhiều mục tiêu, trong khi bẫy gây bất lợi cho người chơi.",
        tip: "Đưa bóng tới bom khi có nhiều mục tiêu xung quanh nhưng tránh các khu vực có bẫy."
    },

    8: {
        name: "Portal",
        objective: "Sử dụng các cổng dịch chuyển để đưa bóng tới những vị trí thuận lợi.",
        mechanic: "Bóng đi vào một portal sẽ xuất hiện tại portal còn lại.",
        tip: "Quan sát vị trí cổng ra để dự đoán hướng tiếp theo của bóng."
    },

    9: {
        name: "Gravity Zone",
        objective: "Phá hủy toàn bộ mục tiêu trong môi trường có lực tác động lên bóng.",
        mechanic: "Các vùng trọng lực hoặc gió sẽ làm thay đổi quỹ đạo của bóng.",
        tip: "Đừng chỉ nhìn hướng hiện tại của bóng, hãy tính cả lực đang tác động lên nó."
    },

    10: {
        name: "Boss Battle",
        objective: "Đánh bóng vào Boss cho đến khi thanh máu của Boss về 0.",
        mechanic: "Boss có thể di chuyển và tấn công. Nếu người chơi hết máu, trận đấu kết thúc.",
        tip: "Ưu tiên né đòn của Boss nhưng vẫn giữ bóng trong sân để duy trì sát thương."
    }
};

export function getLevelObjective(level) {
    return LEVEL_OBJECTIVES[level] || LEVEL_OBJECTIVES[1];
}