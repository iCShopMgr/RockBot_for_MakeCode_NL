let buf = pins.createBuffer(2);

function Move_direction (Speed1: number, Speed2: number, Speed3: number, Speed4: number) {
	buf[0]=0x00;
    buf[1]=Speed1;
    pins.i2cWriteBuffer(0x38, buf);
    buf[0]=0x01;
    buf[1]=Speed2;
    pins.i2cWriteBuffer(0x38, buf);
    buf[0]=0x02;
    buf[1]=Speed3;
    pins.i2cWriteBuffer(0x38, buf);
    buf[0]=0x03;
    buf[1]=Speed4;
    pins.i2cWriteBuffer(0x38, buf);
}

function Servo_angle (Servo_ch: number, Degree:number) {
    if (Degree > 180) {
        Degree = 180;
    }
    if (Degree < 0) {
        Degree = 0;
    }
    buf[0]= Servo_ch | 0x10;
    buf[1]=Degree;
    pins.i2cWriteBuffer(0x38, buf);
}

/**
 * RockBot
 */
//% weight=0 color=#dbb502 icon="\uf0b2" block="rockbot"
namespace rockbot {
    export enum Direction {
        //% block="Move_forward"
        direct1 = 1,
        //% block="Move_back"
        direct2 = 2,
        //% block="Move_turnleft"
        direct3 = 3,
        //% block="Move_turnright"
        direct4 = 4,
        //% block="Move_left"
        direct5 = 5,
        //% block="Move_right"
        direct6 = 6,
        //% block="Move_frontright"
        direct7 = 7,
        //% block="Move_backleft"
        direct8 = 8,
        //% block="Move_frontleft"
        direct9 = 9,
        //% block="Move_backright"
        direct10 = 10,
        //% block="Move_stop"
        direct11 = 11
    }

    //% blockId="RockBot_motor_go" block="RockBot move %direction |speed %movespeed |(0~127)"
    //% weight=10
	export function RockBot_motor_go(direction: Direction = 1, movespeed: number): void {
		if(movespeed > 127)movespeed = 127;
		if(movespeed < 0)movespeed = 0;

        switch(direction) {
			case 1:
				Move_direction(movespeed, movespeed, movespeed, movespeed);
				break;
			case 2:
				Move_direction(movespeed*(-1), movespeed*(-1), movespeed*(-1), movespeed*(-1));
				break;
			case 3:
				Move_direction(movespeed*(-1), movespeed, movespeed*(-1), movespeed);
				break;
			case 4:
				Move_direction(movespeed, movespeed*(-1), movespeed, movespeed*(-1));
                break;
            case 5:
                Move_direction(movespeed*(-1), movespeed, movespeed, movespeed*(-1));
                break;
            case 6:
                Move_direction(movespeed, movespeed*(-1), movespeed*(-1), movespeed);
                break;
            case 7:
                Move_direction(movespeed, 0, 0, movespeed);
                break;
            case 8:
                Move_direction(movespeed*(-1), 0, 0, movespeed*(-1));
                break;
            case 9:
                Move_direction(0, movespeed, movespeed, 0);
                break;
            case 10:
                Move_direction(0, movespeed*(-1), movespeed*(-1), 0);
                break;
            case 11:
                Move_direction(0, 0, 0, 0);
                break;
		}
	}

    //% blockId="RockBot_motor_control" block="RockBot Control Motor Speed |LF%lf RF%rf LB%lb RB%rb"
    //% weight=9
	export function RockBot_motor_control(lf: number=0, rf: number=0, lb: number=0, rb: number=0): void {
		if(lf > 127)lf = 127;
		if(lf < -127)lf = -127;
        if(rf > 127)rf = 127;
		if(rf < -127)rf = -127;
        if(lb > 127)lb = 127;
		if(lb < -127)lb = -127;
        if(rb > 127)rb = 127;
		if(rb < -127)rb = -127;

		Move_direction(lf, rf, lb, rb);
	}

    export enum servo_ch {
        //% block="S1"
        ch1 = 1,
        //% block="S2"
        ch2 = 2
    }

    //% blockId="RockBot_servo_control" block="RockBot Control Servo %servo_ch |degree %degree |(0~90)"
    //% weight=8
	export function RockBot_servo_control(channel: servo_ch = 1, degree: number): void {
        switch(channel) {
			case 1:
				Servo_angle(0, degree);
				break;
			case 2:
				Servo_angle(1, degree);
				break;
		}
	}

    let _brightness = 25
    let neopixel_buf = pins.createBuffer(16 * 2);
    for (let i = 0; i < 16 * 2; i++) {
        neopixel_buf[i] = 0
    }
    for (let i = 0; i < 2; i++) {
        rgb_led_clear();
    }

    //% brightness.min=0 brightness.max=255
    //% blockId="RGB_LED_set_brightness" block="RGB LED set brightness to |%brightness |(0~255)"
    //% weight=7
    export function rgb_led_set_setBrightness(brightness: number) {
        _brightness = brightness;
    }

    //% rgb.shadow="colorNumberPicker"
    //%  blockId="RGB_LED_show_all" block="All RGB LED show color|%rgb"
    //% weight=6
    export function rgb_led_show_all(rgb: number): void{
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 2; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }

    export enum led_ch {
        //% block="L1"
        ch1 = 1,
        //% block="L2"
        ch2 = 2
    }

    //% rgb.shadow="colorNumberPicker"
    //%  blockId="RGB_LED_show" block="RGB LED |%led_ch_ show color|%rgb"
    //% weight=6
    export function rgb_led_show(led_ch_: led_ch = 1, rgb: number): void{
        let index = 0;
        if (led_ch_ == 1) {
            index = 0;
        }
        else {
            index = 1;
        }
        let f = index;
        let t = index;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if (index > 15) {
            if (((index >> 8) & 0xFF) == 0x02) {
                f = index >> 16;
                t = index & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }

    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% blockId="RGB_LED_set_RGB" block="Red|%r Green|%g Blue|%b"
    //% weight=6
    export function rgb_led_set_RGB(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    //% blockId="RGB_LED_clear" block="RGB LED clear all"
    //% weight=6
    export function rgb_led_clear(): void {
        for (let i = 0; i < 16 * 2; i++) {
            neopixel_buf[i] = 0
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }

    export enum IO_PORT {
        //% block="IO1(P1)"
        IO1 = 1,
        //% block="IO2(P2)"
        IO2 = 2,
        //% block="IO3(P8)"
        IO3 = 3,
        //% block="IO4(P13)"
        IO4 = 4,
        //% block="IO5(P14)"
        IO5 = 5,
        //% block="IO6(P15)"
        IO6 = 6,
        //% block="IO7(P16)"
        IO7 = 7
    }

    export enum IO_STATE {
        //% block="HIGH"
        STATE1 = 1,
        //% block="LOW"
        STATE2 = 0
    }

    //% blockId=IO_digital_write block="Digital Write %choose set velue %voltage"
    //% weight=5
    export function IO_digital_write(choose: IO_PORT = 1, voltage: IO_STATE = 1): void {
        if (choose == 1) {
            pins.digitalWritePin(DigitalPin.P1, voltage);
        }
        else if (choose == 2){
            pins.digitalWritePin(DigitalPin.P2, voltage);
        }
        else if (choose == 3){
            pins.digitalWritePin(DigitalPin.P8, voltage);
        }
        else if (choose == 4){
            pins.digitalWritePin(DigitalPin.P13, voltage);
        }
        else if (choose == 5){
            pins.digitalWritePin(DigitalPin.P14, voltage);
        }
        else if (choose == 6){
            pins.digitalWritePin(DigitalPin.P15, voltage);
        }
        else {
            pins.digitalWritePin(DigitalPin.P16, voltage);
        }
    }

	//% blockId=IO_digital_read block="Digital read %choose"
    //% weight=5
	export function IO_digital_read(choose: IO_PORT = 1): number {
        if (choose == 1) {
            return pins.digitalReadPin(DigitalPin.P1);
        }
        else if (choose == 2){
            return pins.digitalReadPin(DigitalPin.P2);
        }
        else if (choose == 3){
            return pins.digitalReadPin(DigitalPin.P8);
        }
        else if (choose == 4){
            return pins.digitalReadPin(DigitalPin.P13);
        }
        else if (choose == 5){
            return pins.digitalReadPin(DigitalPin.P14);
        }
        else if (choose == 6){
            return pins.digitalReadPin(DigitalPin.P15);
        }
        else {
            return pins.digitalReadPin(DigitalPin.P16);
        }
	}

    //% voltage.min=0 voltage.max=1023
    //% blockId=IO_analog_write block="Analog Write %choose set velue %voltage"
    //% weight=4
    export function IO_analog_write(choose: IO_PORT = 1, voltage: number): void {
        if (choose == 1) {
            pins.analogWritePin(AnalogPin.P1, voltage);
        }
        else if (choose == 2){
            pins.analogWritePin(AnalogPin.P2, voltage);
        }
        else if (choose == 3){
            pins.analogWritePin(AnalogPin.P8, voltage);
        }
        else if (choose == 4){
            pins.analogWritePin(AnalogPin.P13, voltage);
        }
        else if (choose == 5){
            pins.analogWritePin(AnalogPin.P14, voltage);
        }
        else if (choose == 6){
            pins.analogWritePin(AnalogPin.P15, voltage);
        }
        else {
            pins.analogWritePin(AnalogPin.P16, voltage);
        }
    }

    export enum Analog_IO_PORT {
        //% block="IO1(P1)"
        IO1 = 1,
        //% block="IO2(P2)"
        IO2 = 2
    }

    //% blockId=IO_analog_read block="Analog read %choose"
    //% weight=4
	export function IO_analog_read(choose: Analog_IO_PORT = 1): number {
        if (choose == 1) {
            return pins.analogReadPin(AnalogPin.P1);
        }
        else {
            return pins.analogReadPin(AnalogPin.P2);
        }
	}
}
